/// <reference types="bun" />

import { expect, test } from "bun:test";
import { domesticAccountToIban } from "./iban-bank";

test("converts Czech and Slovak account numbers to IBAN", () => {
  expect(domesticAccountToIban("19-2000145399/0800")).toBe(
    "CZ6508000000192000145399"
  );
  expect(domesticAccountToIban(" 1234567899 / 0800 ")).toBe(
    "CZ5508000000001234567899"
  );
  expect(domesticAccountToIban("12345671/7500")).toBe(
    "SK8975000000000012345671"
  );
});

test("leaves typos, unknown banks and IBANs alone", () => {
  expect(domesticAccountToIban("1234567898/0800")).toBeNull();
  expect(domesticAccountToIban("1234567899/1234")).toBeNull();
  expect(domesticAccountToIban("CZ6508000000192000145399")).toBeNull();
  expect(domesticAccountToIban("1234567899/080")).toBeNull();
});
