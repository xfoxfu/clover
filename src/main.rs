#![feature(proc_macro_hygiene, decl_macro)]

extern crate rocket_contrib;
#[macro_use]
extern crate rocket;

use rocket::response::Redirect;
use rocket_contrib::serve::StaticFiles;
use std::process::{Command, Stdio};

mod app;

#[get("/")]
fn index() -> Redirect {
    Redirect::to("/app")
}

fn launch_app() {
    let mut app = rocket::ignite().mount("/", routes![index]);
    app = app.mount("/app", StaticFiles::from("client/dist"));
    // TODO: use include_dir!()
    app.launch();
}
fn main() {
    // start parcel build process in background
    #[cfg(debug_assertions)]
    let mut client_build = Command::new("yarn")
        .arg("watch")
        .current_dir("./client")
        // .stdout(Stdio::null())
        .spawn()
        .unwrap();

    launch_app();

    #[cfg(debug_assertions)]
    client_build
        .kill()
        .expect("yarn build process does not exit normally");
}
