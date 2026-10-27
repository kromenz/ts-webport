import { expect, test } from "vitest";

import { PROFILE, WORK_EXPERIENCE } from "@/src/data/data";

test("profile copy", () => {
  expect(PROFILE.role).toBe("Software Engineer @ RHY Consulting");
  expect(PROFILE.about).toBe(
    "Software engineer. Builds platforms end to end: schema, auth, payments, deploy pipelines. Currently at RHY Consulting, through Alongside.",
  );
  expect(PROFILE.since).toBe(2022);
});

test("Alongside entry says RHY through Alongside", () => {
  const a = WORK_EXPERIENCE.find((e) => e.title === "Alongside")!;
  expect(a.responsibilities[0]).toMatch(
    /^Software engineer at RHY Consulting, through Alongside\./,
  );
});
