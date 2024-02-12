use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::fs::OpenOptions;
use std::io::Write;
use std::process::Command;

use crate::AUTH_TOKEN;

// Assuming AUTH_TOKEN is a constant used in this function,
// you need to pass it as a parameter or manage it differently.
pub async fn handle_create_instance(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
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

    let domain = body_params["domain"].as_str().unwrap_or_default();
    let port = body_params["port"].as_str().unwrap_or_default();
    let _type = body_params["type"].as_str().unwrap_or_default();

    let mut file = OpenOptions::new()
        .append(true)
        .open("/etc/nginx/domain_ports.txt")
        .unwrap();

    if writeln!(file, "{}    {};", domain, port).is_ok() {
        let _ = Command::new("sh")
            .arg("-c")
            .arg(format!("sudo kill -HUP $(cat /var/run/nginx.pid)"))
            .output();

        Ok(Response::builder()
            .status(StatusCode::OK)
            .body(Body::from(json!({ "data": "OK", "error": null }).to_string()))
            .unwrap())
    } else {
        Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "data": null, "error": "Failed to write to file" }).to_string()))
            .unwrap())
    }
}
