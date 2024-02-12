use hyper::{Request, Response, Body, StatusCode};
use serde::Deserialize;
use std::process::Command;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

#[derive(Deserialize)]
struct UpdateData {
    port: String,
    frontend: String,
    backend: String,
}

pub async fn handle_update_route(mut req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    println!("handle_udpate_route");

    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let update_data: UpdateData = serde_json::from_str(&body_str).unwrap();

    // Create or overwrite the frontend file
    let frontend_file_path = format!("/home/ubuntu/proxy-server/routes/frontend.{}.txt", update_data.port);
    println!("frontend_file_path: {}", frontend_file_path);
    let mut frontend_file = File::create(&frontend_file_path).await.unwrap();
    frontend_file.write_all(update_data.frontend.as_bytes()).await.unwrap();

    // Create or overwrite the backend file
    let backend_file_path = format!("/home/ubuntu/proxy-server/routes/backend.{}.txt", update_data.port);
    println!("backend_file_path: {}", backend_file_path);
    let mut backend_file = File::create(&backend_file_path).await.unwrap();
    backend_file.write_all(update_data.backend.as_bytes()).await.unwrap();
    
    println!("update_data.port: {}", update_data.port);

    
    // Concatenate files to create haproxy.cfg
    let concat_command = "cat /home/ubuntu/proxy-server/routes/haproxy.header.cfg /home/ubuntu/proxy-server/routes/frontend.*.txt /home/ubuntu/proxy-server/routes/backend.*.txt > /home/ubuntu/proxy-server/haproxy.cfg";
    let _concat_output = Command::new("sh")
        .arg("-c")
        .arg(concat_command)
        .output()
        .unwrap();

    // Restart haxproxy service
    let pid_output = Command::new("sh")
        .arg("-c")
        .arg("ps -eo pid,ppid,comm | grep haproxy | awk '$2 == 1 {print $1}'")
        .output()
        .unwrap();

    let pid = String::from_utf8_lossy(&pid_output.stdout).trim().to_string();

    if !pid.is_empty() {
        match Command::new("sudo")
            .arg("kill")
            .arg("-HUP")
            .arg(pid)
            .output() {
                Ok(output) => {
                    if !output.status.success() {
                        println!("Failed to send HUP signal: {}", String::from_utf8_lossy(&output.stderr));
                        eprintln!("Failed to send HUP signal: {}", String::from_utf8_lossy(&output.stderr));
                    } else {
                        println!("output.status.success - haxproxy reset");
                    }
                },
                Err(e) => {
                    eprintln!("Failed to execute command: {}", e);
                    println!("Failed to execute command: {}", e);
                }
        }
    } else {
        println!("HAProxy master process not found.");
    }
    

    // Return response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from("Route updated and haxproxy configuration reloaded"))
        .unwrap())
}
