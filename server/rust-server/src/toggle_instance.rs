use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::fs::{OpenOptions, File};
use std::io::{Write, BufRead, BufReader};
use std::process::Command;

use crate::AUTH_TOKEN;

pub async fn handle_toggle_instance(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    if let Some(auth_header) = req.headers().get(hyper::header::AUTHORIZATION) {
        if auth_header != AUTH_TOKEN {
            return Ok(Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::from(json!({ "error": "Unauthorized" }).to_string()))
                .unwrap());
        }
    } else {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from(json!({ "error": "No Authorization Header" }).to_string()))
            .unwrap());
    }

    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let body_params: serde_json::Value = serde_json::from_str(&body_str).unwrap();

    let domain = body_params["domain"].as_str().unwrap_or_default();
    let port = body_params["port"].as_str().unwrap_or_default();
    let status = body_params["status"].as_str().unwrap_or_default();

    // println!("toggleinstance port {} status {}", port, status);

    // Modify the /etc/nginx/domain_ports.txt file
    let mut file_content = String::new();
    {
        let file = File::open("/etc/nginx/domain_ports.txt").unwrap();
        let reader = BufReader::new(file);
        for line in reader.lines() {
            let line = line.unwrap();
            if !line.starts_with(&(domain.to_owned() + "    ")) {
                file_content.push_str(&line);
                file_content.push('\n');
            }
        }
    }

    file_content.push_str(&format!("{}    {};\n", domain, status));

    {
        let mut file = OpenOptions::new()
            .write(true)
            .truncate(true)
            .open("/etc/nginx/domain_ports.txt")
            .unwrap();

        if file.write_all(file_content.as_bytes()).is_ok() {
            let _ = Command::new("sh")
                .arg("-c")
                .arg("sudo kill -HUP $(cat /var/run/nginx.pid)")
                .output();
        } else {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(json!({ "error": "Failed to write to file" }).to_string()))
                .unwrap());
        }
    }

    // Run Docker command if status is less than 5 characters long
    if status.len() < 5 {
        let _ = Command::new("docker")
            .args(&["stop", "-t", "0", port])
            .output();
    }

    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "OK" }).to_string()))
        .unwrap())
}
