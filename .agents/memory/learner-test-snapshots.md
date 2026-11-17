---
name: Learner test snapshots
description: Avoid false-positive profile and localization coverage in server-rendered Zustand component tests.
---

Zustand server rendering uses its initial snapshot, even after the bound store's state is changed. A loop that changes language or profile and then server-renders a component may silently test the initial English/empty profile every time.

**Why:** A test initially passed profile rendering checks while its rendered language remained English. Assertions on translated output exposed that the fixture was not reaching the hook.

**How to apply:** In server-rendered component tests, provide a selector-aware store mock backed by the current fixture, and assert an actual translated string or profile-specific value. Keep real-store persistence/normalization tests separate from that render adapter.
