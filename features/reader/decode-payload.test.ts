/// <reference types="bun" />

import { expect, test } from "bun:test";
import { CurrencyCode } from "bysquare/pay";
import { buildQrPayload } from "@/features/payment/qr-payload";
import { decodePayload } from "./decode-payload";

const IBAN = "SK3112000000198742637541";

test("PAY by square round-trips through the encoder", () => {
  const { payload } = buildQrPayload(
    {
      format: "bysquare",
      iban: IBAN,
      amount: 12.5,
      variableSymbol: "123",
      recipientName: "Jan Novak",
      paymentNote: "Faktura 7",
      paymentDueDate: "2026-11-30",
      invoiceId: "F7",
    },
    IBAN
  );
  expect(decodePayload(payload)).toEqual({
    ok: true,
    warnings: [],
    payment: expect.objectContaining({
      format: "bysquare",
      currency: "EUR",
      iban: IBAN,
      amount: 12.5,
      variableSymbol: "123",
      recipientName: "Jan Novak",
      paymentNote: "Faktura 7",
      paymentDueDate: "2026-11-30",
      invoiceId: "F7",
    }),
  });
});

test("SPAYD round-trips, escapes included", () => {
  const { payload } = buildQrPayload(
    {
      format: "spayd",
      iban: "CZ6508000000192000145399",
      amount: 450,
      variableSymbol: "2026",
      paymentNote: "Nájom * 100% + záloha",
      bic: "GIBACZPX",
      instantPayment: true,
    },
    "CZ6508000000192000145399",
    CurrencyCode.CZK
  );
  const result = decodePayload(payload);
  expect(result).toEqual({
    ok: true,
    warnings: [],
    payment: expect.objectContaining({
      format: "spayd",
      currency: "CZK",
      iban: "CZ6508000000192000145399",
      bic: "GIBACZPX",
      amount: 450,
      variableSymbol: "2026",
      paymentNote: "Nájom * 100% + záloha",
      instantPayment: true,
    }),
  });
});

test("EPC round-trips and keeps a structured reference", () => {
  const { payload } = buildQrPayload(
    {
      format: "epc",
      iban: "DE89370400440532013000",
      amount: 99.99,
      recipientName: "Max Muster",
      paymentNote: "Invoice 42",
    },
    "DE89370400440532013000"
  );
  expect(decodePayload(payload)).toEqual({
    ok: true,
    warnings: [],
    payment: expect.objectContaining({
      format: "epc",
      iban: "DE89370400440532013000",
      amount: 99.99,
      recipientName: "Max Muster",
      paymentNote: "Invoice 42",
    }),
  });

  const structured =
    "BCD\r\n002\r\n1\r\nSCT\r\n\r\nMax\r\nDE89370400440532013000\r\nUSD5\r\n\r\nRF18539007547034";
  expect(decodePayload(structured)).toMatchObject({
    ok: true,
    warnings: ["unsupportedCurrency"],
    payment: { paymentNote: "RF18539007547034", amount: 5 },
  });
});

test("rejects text that is no payment code", () => {
  expect(decodePayload("https://example.com")).toEqual({ ok: false });
  expect(decodePayload("   ")).toEqual({ ok: false });
});

test("flags an IBAN with a wrong checksum", () => {
  const spayd = "SPD*1.0*ACC:CZ6508000000192000145398*AM:1.00*CC:CZK";
  expect(decodePayload(spayd)).toMatchObject({
    ok: true,
    warnings: ["invalidIban"],
  });
});
