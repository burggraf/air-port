use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::{fs, process::Command};
use std::path::Path;

use crate::AUTH_TOKEN;

pub async fn handle_setup_marmot(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    //println!("handle_setup_marmot");

    // Check for authorization
    if let Some(auth_header) = req.headers().get(hyper::header::AUTHORIZATION) {
        if auth_header != AUTH_TOKEN {
            return Ok(Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::from(json!({ "data": null, "error": "Unauthorized" }).to_string()))
                .unwrap());
        }
    } else {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from(json!({ "data": null, "error": "No Authorization Header" }).to_string()))
            .unwrap());
    }

    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let body_params: serde_json::Value = serde_json::from_str(&body_str).unwrap();

    let port = body_params["port"].as_str().unwrap_or_default();
    let config_file = body_params["config_file"].as_str().unwrap_or_default();
    //println!("port: {}", port);
    //println!("config_file: {}", config_file);

    // Check if config_file is empty
    if config_file.is_empty() {
        let toml_path = format!("/home/ubuntu/data/{}/marmot/marmot.toml", port);
        if Path::new(&toml_path).exists() {
            fs::remove_file(&toml_path).unwrap();
            //println!("marmot.toml deleted as config_file is empty");
        }
    } else {
        // Step 1: Create folder /home/ubuntu/data/<PORT>/marmot
        let folder_path = format!("/home/ubuntu/data/{}/marmot", port);
        if !Path::new(&folder_path).exists() {
            fs::create_dir_all(&folder_path).unwrap();
        }
        //println!("step 1 complete");

        // Step 2: Create marmot.toml with the contents of config_file
        let toml_path = format!("{}/marmot.toml", folder_path);
        fs::write(&toml_path, config_file).unwrap();
        //println!("step 2 complete");
    }

    // Step 3: Check if a container with name <PORT> is running
    let output = Command::new("docker")
    .arg("ps")
    .arg("-q")
    .arg("--filter")
    .arg(format!("name={}", port))
    .output()
    .expect("Failed to execute docker command");

    if !output.stdout.is_empty() {
    // Step 4: Stop the container if it's running
    Command::new("docker")
        .arg("stop")
        .arg("-t")
        .arg("0")
        .arg(port)
        .output()
        .expect("Failed to stop container");
    //println!("Container {} stopped", port);
    }

    // Return success response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "Marmot setup complete", "error": null }).to_string()))
        .unwrap())
}
