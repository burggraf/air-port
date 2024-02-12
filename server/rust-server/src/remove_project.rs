use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::fs::{self};
// use std::io::{Write, BufReader, BufRead};
use std::process::Command;

use crate::AUTH_TOKEN; // Assuming AUTH_TOKEN is defined elsewhere in your crate

pub async fn handle_remove_project(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    // Authorization check
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

    // let domain = body_params["domain"].as_str().unwrap_or_default();
    let port = body_params["port"].as_str().unwrap_or_default();

       // Delete specified files
       let frontend_file = format!("/home/ubuntu/proxy-server/routes/frontend.{}.txt", port);
       let backend_file = format!("/home/ubuntu/proxy-server/routes/backend.{}.txt", port);
   
       if let Err(_e) = fs::remove_file(&frontend_file) {
           // Handle error
       }
       if let Err(_e) = fs::remove_file(&backend_file) {
           // Handle error
       }
   
       // Recreate haproxy.cfg
       let haproxy_cmd = "cat /home/ubuntu/proxy-server/routes/haproxy.header.cfg /home/ubuntu/proxy-server/routes/frontend.*.txt /home/ubuntu/proxy-server/routes/backend.*.txt > /home/ubuntu/proxy-server/haproxy.cfg";
       let _output = Command::new("sh")
           .arg("-c")
           .arg(&haproxy_cmd)
           .output();
    
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


    // Stop Docker container if it's running
    let _docker_stop_output = Command::new("docker")
        .args(&["stop", "-t", "0", port])
        .output();

    // remove the user's data
    
    // Construct the directory path
    let directory_path = format!("/home/ubuntu/data/{}", port);

    // Execute the command to delete the directory
    match Command::new("rm")
        .args(&["-rf", &directory_path])
        .output() {
            Ok(output) => {
                if !output.status.success() {
                    // Handle the case where the directory deletion fails
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": "Failed to delete directory" }).to_string()))
                        .unwrap());
                }
            },
            Err(_) => {
                // Handle the case where the command execution fails
                return Ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::from(json!({ "data": null, "error": "Failed to execute directory delete command" }).to_string()))
                    .unwrap());
            }
    }

    // Respond with success
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "OK", "error": null }).to_string()))
        .unwrap())

}
