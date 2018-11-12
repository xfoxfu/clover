use std::fs::File;

#[cfg(debug_assertions)]
#[get("/app")]
fn app_home() -> Option<File> {
  File::open("client/dist/index.html").ok()
}

#[cfg(debug_assertions)]
#[get("/app/<path>")]
fn app_static(path: String) -> Option<File> {
  let filename = format!("client/dist/{}", path);
  File::open(&filename).ok()
}
