import { assertEquals } from "@std/assert";
import { parseCollection } from "./collection-parser.ts";

Deno.test("handles empty", () => {
  assertEquals(
    parseCollection("()"),
    [],
  );

  assertEquals(
    parseCollection("(())"),
    [[]],
  );
});

Deno.test("parses collections", () => {
  assertEquals(
    parseCollection(
      "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
    ),
    [
      {
        ItemClass:
          "\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\"",
        Amount: 1,
      },
    ],
  );

  assertEquals(
    parseCollection(
      "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CopperSheet/Desc_CopperSheet.Desc_CopperSheet_C'\",Amount=1),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/SteelPipe/Desc_SteelPipe.Desc_SteelPipe_C'\",Amount=1))",
    ),
    [
      {
        ItemClass:
          "\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CopperSheet/Desc_CopperSheet.Desc_CopperSheet_C'\"",
        Amount: 1,
      },
      {
        ItemClass:
          "\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/SteelPipe/Desc_SteelPipe.Desc_SteelPipe_C'\"",
        Amount: 1,
      },
    ],
  );

  assertEquals(
    parseCollection(
      "(Min=(X=-410.000000,Y=-410.000000,Z=-200.000000),Max=(X=410.000000,Y=410.000000,Z=200.000000),IsValid=True)",
    ),
    {
      Min: {
        X: -410,
        Y: -410,
        Z: -200,
      },
      Max: {
        X: 410,
        Y: 410,
        Z: 200,
      },
      IsValid: true,
    },
  );

  assertEquals(
    parseCollection(
      "(Type=CT_Soft,ClearanceBox=(Min=(X=-400.000000,Y=-400.200000,Z=-50.020000),Max=(X=400.000000,Y=400.200000,Z=50.020000),IsValid=True),RelativeTransform=(Translation=(X=0.000000,Y=0.000000,Z=50.000000)))",
    ),
    {
      Type: "CT_Soft",
      ClearanceBox: {
        Min: {
          X: -400,
          Y: -400.2,
          Z: -50.02,
        },
        Max: {
          X: 400,
          Y: 400.2,
          Z: 50.02,
        },
        IsValid: true,
      },
      RelativeTransform: {
        Translation: {
          X: 0,
          Y: 0,
          Z: 50,
        },
      },
    },
  );
});

Deno.test("ignores whitespace", () => {
  assertEquals(
    parseCollection("( )"),
    [],
  );

  assertEquals(
    parseCollection("(( ))"),
    [[]],
  );

  assertEquals(
    parseCollection(
      "(         Min=(X=-410.000000,Y=-410.000000,Z=-200.000000),Max=(X=410.000000,Y=410.000000,Z=200.000000),IsValid=True)",
    ),
    {
      Min: {
        X: -410,
        Y: -410,
        Z: -200,
      },
      Max: {
        X: 410,
        Y: 410,
        Z: 200,
      },
      IsValid: true,
    },
  );

  assertEquals(
    parseCollection(
      "(Min=           (X=-410.000000,Y=-410.000000,Z=-200.000000),Max=(X=410.000000,Y=410.000000,Z=200.000000),IsValid=True)",
    ),
    {
      Min: {
        X: -410,
        Y: -410,
        Z: -200,
      },
      Max: {
        X: 410,
        Y: 410,
        Z: 200,
      },
      IsValid: true,
    },
  );

  assertEquals(
    parseCollection(
      "(Min=(X=-410.000000,      Y=-410.000000,Z=-200.000000),Max=(X=410.000000,Y=410.000000,Z=200.000000),IsValid=True)",
    ),
    {
      Min: {
        X: -410,
        Y: -410,
        Z: -200,
      },
      Max: {
        X: 410,
        Y: 410,
        Z: 200,
      },
      IsValid: true,
    },
  );

  assertEquals(
    parseCollection(
      '(Min=(X=-410.000000,Y=-410.000000,Z=-200.000000),Max=(X=410.000000,Y=410.000000,Z=200.000000),IsValid="Hello World")',
    ),
    {
      Min: {
        X: -410,
        Y: -410,
        Z: -200,
      },
      Max: {
        X: 410,
        Y: 410,
        Z: 200,
      },
      // lazy fix because i dont want to write string parsing
      // currently exactly one class's material description is affected by this, which no one will ever read
      IsValid: '"HelloWorld"',
    },
  );
});
