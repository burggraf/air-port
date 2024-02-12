use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::fs::{OpenOptions, File};
use std::io::{Write, BufRead, BufReader};
use std::process::Command;

use crate::AUTH_TOKEN;

pub async fn handle_change_version(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    // println!("change_version starting");

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

    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let body_params: serde_json::Value = serde_json::from_str(&body_str).unwrap();

    let domain = body_params["domain"].as_str().unwrap_or_default();
    let pb_version = body_params["pb_version"].as_str().unwrap_or_default();
    // println!("domain {}", domain);
    // println!("pb_version {}", pb_version);

    // Read and modify /etc/nginx/domain_pb_version.txt
    let mut file_content = String::new();
    let mut domain_exists = false;

    {
        let file = File::open("/etc/nginx/domain_pb_version.txt").unwrap();
        let reader = BufReader::new(file);
        for line in reader.lines() {
            let line = line.unwrap();
            if line.starts_with(&(domain.to_owned() + "    ")) {
                file_content.push_str(&format!("{}    {};\n", domain, pb_version));
                domain_exists = true;
            } else {
                file_content.push_str(&line);
                file_content.push('\n');
            }
        }
    }

    if !domain_exists {
        file_content.push_str(&format!("{}    {};\n", domain, pb_version));
    }

    // Write back to the file
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open("/etc/nginx/domain_pb_version.txt")
        .unwrap();

    if file.write_all(file_content.as_bytes()).is_ok() {
        let _ = Command::new("sh")
            .arg("-c")
            .arg("sudo kill -HUP $(cat /var/run/nginx.pid)")
            .output();
        // println!("file written and nginx restarted", );

    } else {
        return Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "error": "Failed to write to file" }).to_string()))
            .unwrap());
    }

    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "Version updated" }).to_string()))
        .unwrap())
}
