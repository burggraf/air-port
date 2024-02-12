use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use std::process::Command;

use crate::AUTH_TOKEN;

pub async fn handle_create_user(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {

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
    let body_params: serde_json::Value = serde_json::from_str(&body_str).unwrap();

    let username = body_params["username"].as_str().unwrap_or_default();
    let port = body_params["port"].as_str().unwrap_or_default();
    let ssh_keys = body_params["ssh_keys"].as_str().unwrap_or_default();

    let ssh_dir = format!("/home/ubuntu/data/{}/.ssh", port);
    create_dir_all(&ssh_dir).unwrap();

    let authorized_keys_path = format!("{}/authorized_keys", ssh_dir);
    let mut authorized_keys_file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(authorized_keys_path)
        .unwrap();

    if authorized_keys_file.write_all(ssh_keys.as_bytes()).is_ok() {
        let commands = format!(
            "sudo docker exec ssh-server sh -c '/create-user.sh {1} {0}'", port, username
        );

        let _ = Command::new("sh")
            .arg("-c")
            .arg(commands)
            .output();

        Ok(Response::builder()
            .status(StatusCode::OK)
            .body(Body::from(json!({ "data": "User created", "error": null }).to_string()))
            .unwrap())
    } else {

        Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "data": null, "error": "Failed to create user" }).to_string()))
            .unwrap())
    }    
}
