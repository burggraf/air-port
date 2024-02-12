use hyper::{Request, Response, Body, StatusCode};
use serde_json::{json, Value};
use std::{process::Command, str};

use crate::AUTH_TOKEN;

pub async fn handle_get_disk_space(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    println!("getdiskspace");

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

    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let body_params: Value = serde_json::from_str(&body_str).unwrap();

    let port = body_params["port"].as_str().unwrap_or_default();
    let depth = body_params["depth"].as_str().unwrap_or_default();

    let disk_space_command = format!("du -bd {} /home/ubuntu/data/{} | sed 's/\\/home\\/ubuntu\\/data\\///' | sed 's/{}//'", depth, port, port);
    println!("disk_space_command: {}", disk_space_command);

    match Command::new("sh")
        .arg("-c")
        .arg(&disk_space_command)
        .output() {
        Ok(output) => {
            let output_str = str::from_utf8(&output.stdout).unwrap();
            let data: Vec<&str> = output_str.split('\n').collect();
            Ok(Response::builder()
                .status(StatusCode::OK)
                .body(Body::from(json!({ "data": data, "error": null }).to_string()))
                .unwrap())
        },
        Err(_) => return Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "data": null, "error": "Failed to execute disk space command" }).to_string()))
            .unwrap()),
    }
}
