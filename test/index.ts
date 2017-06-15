"use strict";

process.env.NODE_ENV = "test";
import "../bin/run";
import models from "./models";

describe("models", models);
