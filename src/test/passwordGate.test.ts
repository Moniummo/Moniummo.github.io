import { beforeEach, describe, expect, it } from "vitest";
import {
  grantAllySessionAccess,
  hasAllySessionAccess,
  splitConfiguredPasswordHashes,
} from "@/lib/passwordGate";

describe("password gates", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("normalizes configured hashes from supported env separators", () => {
    expect(splitConfiguredPasswordHashes(" HASH-ONE,\nhash-two ; Hash-Three ")).toEqual([
      "hash-one",
      "hash-two",
      "hash-three",
    ]);
  });

  it("keeps Ally access scoped to a granted session", () => {
    expect(hasAllySessionAccess()).toBe(false);

    grantAllySessionAccess();

    expect(hasAllySessionAccess()).toBe(true);
  });
});
