tsc
tslint -p .
pkg . --target node8-macos-x64 --out-path=build
cp ./node_modules/bcrypt/lib/binding/*.node build/
cp ./node_modules/sqlite3/lib/binding/**/*.node build/