"use strict";

import User from "../../models/user";
import * as chai from "chai";
const expect = chai.expect;
import config from "../../lib/config";

export default () => {
  describe("#setPassword", () => {
    const user = new User("user@example.com");
    it("should works", () => user.setPassword("test"));
  });
  describe("#checkPassword", () => {
    const user = new User("user@example.com");
    user.setPassword("A");
    it("returns true on success", async () => {
      // tslint:disable-next-line:no-unused-expression
      expect(await user.checkPassword("A")).to.be.true;
    });
    it("returns false on failure", async () => {
      // tslint:disable-next-line:no-unused-expression
      expect(await user.checkPassword("B")).to.be.false;
    });
  });
  describe("#setConnPassword", () => {
    const user = new User("user@example.com");
    it("should return the new password", () => {
      expect(user.setConnPassword()).to.eql(user.connPassword);
    });
  });
  describe("#allocConnPort", () => {
    const user = new User("user@example.com");
    it("should return new port according to config", async () => {
      const oldPort = config.get("port_last_allocated");
      expect(await user.allocConnPort()).to.eql(oldPort + 1);
    });
    it("should write new port to config", async () => {
      expect(await user.allocConnPort()).to.eql(config.get("port_last_allocated"));
    });
  });
};
