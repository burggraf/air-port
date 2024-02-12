use hyper::{Request, Response, Body, StatusCode};
use serde_json::{json, Value};
use std::{process::Command, env};

use crate::AUTH_TOKEN;

pub async fn handle_sync(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    println!("handle_sync");

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

    let command = body_params["command"].as_str().unwrap_or_default();
    println!("command: {}", command);

    env::set_current_dir("/home/ubuntu/data").unwrap();

    let sync_command = format!("rclone {}", command);
    println!("sync_command: {}", sync_command);
    match Command::new("sh")
        .arg("-c")
        .arg(&sync_command)
        .output() {
        Ok(_) => (),
        Err(_) => return Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "data": null, "error": "Failed to execute sync command" }).to_string()))
            .unwrap()),
    };

    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "Sync operation complete", "error": null }).to_string()))
        .unwrap())
}
