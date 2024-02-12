use hyper::{Body, Request, Response, StatusCode};
use serde::{Serialize, Deserialize};
use serde_yaml::{Value, Sequence};
use std::fs;
use std::process::Command;

#[derive(Serialize, Deserialize, Debug)]
struct YamlDb {
    path: String,
    replicas: Vec<YamlReplica>,
}

#[derive(Serialize, Deserialize, Debug)]
struct YamlReplica {
    #[serde(rename = "type")]
    replica_type: String,
    bucket: String,
    path: String,
    endpoint: String,
    #[serde(rename = "access-key-id")]
    access_key_id: String,
    #[serde(rename = "secret-access-key")]
    secret_access_key: String,
    #[serde(rename = "force-path-style")]
    force_path_style: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct YamlDbs {
    dbs: Vec<YamlDb>,
}

#[derive(Deserialize)]
struct BackupSettings {
    db_access_key_id: Option<String>,
    db_endpoint: Option<String>,
    db_secret_access_key: Option<String>,
    logs_access_key_id: Option<String>,
    logs_endpoint: Option<String>,
    logs_secret_access_key: Option<String>,
    port: String,
    site_domain: String,
}

fn update_or_create_block(dbs: &mut Sequence, path: &str, settings: &BackupSettings, is_data_db: bool) {
    let mut found = false;

    // Conditional assignment based on whether it's data.db or logs.db
    let endpoint = if is_data_db {
        settings.db_endpoint.as_ref()
    } else {
        settings.logs_endpoint.as_ref()
    };

    let access_key_id = if is_data_db {
        settings.db_access_key_id.as_ref()
    } else {
        settings.logs_access_key_id.as_ref()
    };

    let secret_access_key = if is_data_db {
        settings.db_secret_access_key.as_ref()
    } else {
        settings.logs_secret_access_key.as_ref()
    };

    // Ensure that all necessary fields are present
    if let (Some(endpoint), Some(access_key_id), Some(secret_access_key)) = (endpoint, access_key_id, secret_access_key) {
        // Create the updated_db value
        let updated_db = serde_yaml::from_str::<Value>(&format!(
            r#"
            path: {}
            replicas:
              - type: s3
                bucket: azabab
                path: {}/{}
                endpoint: {}
                access-key-id: {}
                secret-access-key: {}
                force-path-style: true
            "#,
            path,
            settings.site_domain.split('.').next().unwrap(),
            settings.port,
            endpoint,
            access_key_id,
            secret_access_key,
        )).unwrap(); // This unwrap is safe as we're sure the format is correct

        for db in dbs.iter_mut() {
            if db["path"] == path {
                *db = updated_db.clone();
                found = true;
                break;
            }
        }

        if !found {
            dbs.push(updated_db);
        }
    }
    // Else, handle the missing data case, possibly with an error or logging.
}

fn format_yaml(docs: &serde_yaml::Value) -> Result<String, serde_yaml::Error> {
    let mut yaml_dbs = YamlDbs { dbs: vec![] };

    if let Some(dbs) = docs["dbs"].as_sequence() {
        for db in dbs {
            let path = db["path"].as_str().unwrap_or_default().to_string();
            let mut replicas = vec![];

            if let Some(replica_seq) = db["replicas"].as_sequence() {
                for replica in replica_seq {
                    let replica = YamlReplica {
                        replica_type: "s3".to_string(),
                        bucket: replica["bucket"].as_str().unwrap_or_default().to_string(),
                        path: replica["path"].as_str().unwrap_or_default().to_string(),
                        endpoint: replica["endpoint"].as_str().unwrap_or_default().to_string(),
                        access_key_id: replica["access-key-id"].as_str().unwrap_or_default().to_string(),
                        secret_access_key: replica["secret-access-key"].as_str().unwrap_or_default().to_string(),
                        force_path_style: replica["force-path-style"].as_bool().unwrap_or_default(),
                    };
                    replicas.push(replica);
                }
            }

            let db = YamlDb { path, replicas };
            yaml_dbs.dbs.push(db);
        }
    }

    serde_yaml::to_string(&yaml_dbs)
}

fn update_yaml(settings: &BackupSettings) -> Result<(), String> {
    let yml_content = fs::read_to_string("/etc/litestream.yml").unwrap_or_else(|_| "".to_string());

    let mut docs: serde_yaml::Value = if yml_content.trim().is_empty() {
        serde_yaml::from_str("dbs: []").map_err(|e| e.to_string())?
    } else {
        serde_yaml::from_str(&yml_content).map_err(|e| e.to_string())?
    };

    let dbs = docs["dbs"].as_sequence_mut().ok_or("Invalid YAML structure")?;

    // Handle data.db block
    let data_db_path = format!("/home/ubuntu/data/{}/pb_data/data.db", settings.port);
    if settings.db_access_key_id.is_some() && settings.db_endpoint.is_some() && settings.db_secret_access_key.is_some() {
        // Update or create data.db block
        update_or_create_block(dbs, &data_db_path, settings, true);
    } else if settings.db_access_key_id.is_none() {
        // Remove data.db block if db_access_key_id is not provided
        remove_block(dbs, &data_db_path);
    }

    // Handle logs.db block
    let logs_db_path = format!("/home/ubuntu/data/{}/pb_data/logs.db", settings.port);
    if settings.logs_access_key_id.is_some() && settings.logs_endpoint.is_some() && settings.logs_secret_access_key.is_some() {
        // Update or create logs.db block
        update_or_create_block(dbs, &logs_db_path, settings, false);
    } else if settings.logs_access_key_id.is_none() {
        // Remove logs.db block if logs_access_key_id is not provided
        remove_block(dbs, &logs_db_path);
    }

    // Serialize the updated 'docs' to YAML using the new formatting approach
    match format_yaml(&docs) {
        Ok(formatted_yml) => {
            fs::write("/etc/litestream.yml", formatted_yml).map_err(|e| e.to_string())?
        },
        Err(e) => return Err(format!("Error formatting YAML: {}", e)),
    }

    Ok(())
}

fn remove_block(dbs: &mut Sequence, path: &str) {
    let index = dbs.iter().position(|db| db["path"] == path);
    if let Some(index) = index {
        dbs.remove(index);
    }
}

pub async fn handle_update_streaming_backup_settings(mut req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();

    // Attempt to deserialize the JSON payload into BackupSettings
    let settings_result: Result<BackupSettings, serde_json::Error> = serde_json::from_str(&body_str);
    if let Err(e) = settings_result {
        // If there's an error in deserialization, return a 400 Bad Request with the error message
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Body::from(format!("Error parsing request body: {:?}", e)))
            .unwrap());
    }

    let settings = settings_result.unwrap();

    // Attempt to update the YAML file
    match update_yaml(&settings) {
        Ok(_) => {
            // Restart litestream.service
            let _ = Command::new("systemctl")
                .args(&["restart", "litestream.service"])
                .output();

            Ok(Response::builder()
                .status(StatusCode::OK)
                .body(Body::from("Backup settings updated"))
                .unwrap())
        },
        Err(e) => {
            // Log the specific error related to YAML processing
            eprintln!("Error updating YAML: {}", e);
            Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(format!("Error updating settings: {}", e)))
                .unwrap())
        },
    }
}
