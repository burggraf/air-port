use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::process::Command;
//use log::{info};

use crate::AUTH_TOKEN;

pub async fn handle_remove_user(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    // env_logger::init();
    //info!("This is an info message from handle_remove_user");

    // Check for authorization header
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

    let username = body_params["username"].as_str().unwrap_or_default();

    // Execute delete-user.sh script
    let commands = format!("sudo docker exec ssh-server sh -c '/delete-user.sh {0}'", username);
    let _ = Command::new("sh")
        .arg("-c")
        .arg(commands)
        .output();

    // Return response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "User removed", "error": null }).to_string()))
        .unwrap())
}
