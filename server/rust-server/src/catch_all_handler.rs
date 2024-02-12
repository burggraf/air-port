use hyper::{Body, Client, Request, Response, Uri, body::to_bytes};
use shiplift::{ContainerOptions, Docker};
use tokio::time::{interval, Duration};
use serde_json::Value; // Add serde_json to your Cargo.toml dependencies

pub async fn handle_catch_all(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    // Clone header values before mutating `req`
    let (original_port, original_uri, pb_version) = clone_request_headers(&req);
    // println!("**** handle_catch_all ****");
    // println!("original_port {}, original_uri {}, pb_version {}",original_port, original_uri, pb_version);
    match create_and_start_docker_container(&original_port, &pb_version).await {
        Ok(_) => { /* Container started successfully */ }

        Err(docker_error) => {            
            // Check for the specific '409 Conflict' error
            // the container is in the process of starting up
            // so we just wait for it here...
            if docker_error.to_string().contains("409 Conflict") {
                // Wait until the server is ready
                while !check_server_ready(&original_port).await {
                    eprintln!("Waiting for server to be ready...");
                    // tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                }
            } else {
                // Log the Docker error
                eprintln!("Docker error: {}", docker_error);
                // Construct a custom error response for other errors
                let custom_error_msg = format!("Docker operation failed: {}", docker_error);
                let custom_error_response = Response::builder()
                    .status(hyper::StatusCode::INTERNAL_SERVER_ERROR)
                    .body(custom_error_msg.into())
                    .expect("Failed to construct error response");

                return Ok(custom_error_response);
            }
        }        
    }

    if !check_server_ready(&original_port).await {
        eprintln!("Server did not start in expected time");
        // Handle this situation appropriately
    }
    
    forward_request(req, &original_port, &original_uri).await

    //Ok(resp)
}

fn clone_request_headers(req: &Request<Body>) -> (String, String, String) {
    let original_port = req.headers().get("X-Original-Port").unwrap().to_str().unwrap().to_string();
    let original_uri = req.headers().get("X-Original-URI").unwrap().to_str().unwrap().to_string();
    let pb_version = req.headers().get("X-PB-Version").unwrap().to_str().unwrap().to_string();    
    (original_port, original_uri, pb_version)
}

async fn create_and_start_docker_container(original_port: &str, pb_version: &str) -> Result<(), shiplift::Error> {
    let docker = Docker::new();
    let base_path = "/home/ubuntu";

    let volume_mounts = vec![
        format!("{}/data/{}/pb_data:/home/pocketbase/pb_data", base_path, original_port),
        format!("{}/data/{}/pb_public:/home/pocketbase/pb_public", base_path, original_port),
        format!("{}/data/{}/pb_migrations:/home/pocketbase/pb_migrations", base_path, original_port),
        format!("{}/data/{}/pb_hooks:/home/pocketbase/pb_hooks", base_path, original_port),
        format!("{}/data/{}/marmot:/marmot", base_path, original_port),
        format!("{}/exe/{}/:/exe:ro", base_path, pb_version), // Modified to include executable_path
    ];

    // let environment_variable = env::var("ENVIRONMENT").unwrap_or_else(|_| "default_value".to_string());
    let container_options = ContainerOptions::builder("pbdocker")
        .name(&original_port)
        .cpus(0.50)
        .memory(256 * 1024 * 1024) // Memory in bytes
        .expose(8090, "tcp", original_port.parse::<u32>().unwrap())
        .volumes(volume_mounts.iter().map(AsRef::as_ref).collect::<Vec<&str>>())
        //.env(vec![&format!("ENVIRONMENT={}", environment_variable)]) // Set the environment variable
        .auto_remove(true)
        .build();

    let container = docker.containers().create(&container_options).await?;

    docker.containers().get(&container.id).start().await?;

    Ok(())
}

async fn check_server_ready(original_port: &str) -> bool {
    let server_uri = format!("http://localhost:{}/api/health", original_port);
    let client = Client::new();
    let mut interval = interval(Duration::from_millis(20));

    for _ in 0..400 { // attempts 200 times at a 50ms interval
        interval.tick().await;
        if let Ok(response) = client.get(Uri::try_from(&server_uri).unwrap()).await {
            if let Ok(body) = to_bytes(response.into_body()).await {
                if let Ok(json) = serde_json::from_slice::<Value>(&body) {
                    if json["code"] == 200 && json["message"] == "API is healthy." {
                        return true;
                    }
                }
            }
        }
        // Optionally handle connection errors or log attempts
    }

    false
}

async fn forward_request(mut req: Request<Body>, original_port: &str, original_uri: &str) -> Result<Response<Body>, hyper::Error> {
    let method = req.method().clone();
    let headers = req.headers().clone();
    let entire_body = hyper::body::to_bytes(req.body_mut()).await?;
    
    let client = Client::new();
    let forward_uri = format!("http://localhost:{}{}", original_port, original_uri);

    let mut forward_req_builder = Request::builder()
        .method(method)
        .uri(forward_uri);

    // Apply the cloned headers to the new request
    for (key, value) in headers.iter() {
        forward_req_builder = forward_req_builder.header(key, value);
    }

    let forward_req = forward_req_builder
        .body(Body::from(entire_body))
        .unwrap();

    client.request(forward_req).await
}