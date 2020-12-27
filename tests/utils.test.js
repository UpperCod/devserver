import test from "ava";
import { pathname } from "../src/utils.js";

test("pathname", (t) => {
    t.is(pathname("./my-folder/"), "my-folder/");
});

test("pathname remove search", (t) => {
    t.is(pathname("./my-folder?run=100&more=100"), "my-folder");
});
