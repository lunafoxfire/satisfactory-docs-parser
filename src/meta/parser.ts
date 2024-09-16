import { DocsMeta } from "@/types";
import { NativeSubclassesBySuperclass } from "@/native-defs/types";
import { categorizedClassnames } from "@/class-categorizer";
import { CategorizedNativeClasses, CategoryKey } from "@/class-categorizer/types";

interface TrackedPropertyInfo {
  count: number;
  firstValue: unknown;
  isStatic: boolean;
}

export function createMeta(classMap: NativeSubclassesBySuperclass, categorizedClasses: CategorizedNativeClasses): DocsMeta {
  const meta: DocsMeta = {
    superclassCount: 0,
    superclassList: [],
    superclasses: {},
    categories: {},
  };

  // Superclass metadata
  Object.entries(classMap).forEach(([superclass, subclasses]) => {
    meta.superclassList.push(superclass);
    subclasses.forEach((subclass) => {
      Object.keys(subclass).forEach((key) => {
        if (key === "ClassName") {
          return;
        }
      });
    });
  });
  meta.superclassCount = meta.superclassList.length;

  // Metadata per superclass
  Object.entries(classMap).forEach(([superclass, subclasses]) => {
    const subclassList: string[] = [];
    const universalProps: string[] = [];
    const specializedProps: string[] = [];
    const singleClassProps: string[] = [];
    const staticProps: string[] = [];

    const propertyTracker: Record<string, TrackedPropertyInfo> = {};
    subclasses.forEach((subclass) => {
      subclassList.push(subclass.ClassName);
      Object.entries(subclass).forEach(([key, val]) => {
        if (key === "ClassName") {
          return;
        }
        if (!propertyTracker[key]) {
          propertyTracker[key] = {
            count: 1,
            firstValue: val,
            isStatic: true,
          };
        }
        else {
          const propInfo = propertyTracker[key];
          propInfo.count += 1;
          if (propInfo.isStatic && propInfo.firstValue !== val) {
            propInfo.isStatic = false;
          }
        }
      });
    });

    Object.entries(propertyTracker).forEach(([key, propInfo]) => {
      if (propInfo.count === 1) {
        singleClassProps.push(key);
        return;
      }
      if (propInfo.isStatic) {
        staticProps.push(key);
        return;
      }
      if (propInfo.count === subclassList.length) {
        universalProps.push(key);
      }
      else {
        specializedProps.push(key);
      }
    });

    meta.superclasses[superclass] = {
      subclassCount: subclassList.length,
      subclasses: subclassList,
      universalProps,
      specializedProps,
      singleClassProps,
      staticProps,
    };
  });

  // Metadata per category
  Object.entries(categorizedClasses).forEach(([category, subclasses]) => {
    const superclassList = categorizedClassnames[category as CategoryKey];
    const subclassList: string[] = [];
    const universalProps: string[] = [];
    const specializedProps: string[] = [];
    const singleClassProps: string[] = [];
    const staticProps: string[] = [];

    const propertyTracker: Record<string, TrackedPropertyInfo> = {};
    subclasses.forEach((subclass) => {
      subclassList.push(subclass.ClassName);
      Object.entries(subclass).forEach(([key, val]) => {
        if (key === "ClassName") {
          return;
        }
        if (!propertyTracker[key]) {
          propertyTracker[key] = {
            count: 1,
            firstValue: val,
            isStatic: true,
          };
        }
        else {
          const propInfo = propertyTracker[key];
          propInfo.count += 1;
          if (propInfo.isStatic && propInfo.firstValue !== val) {
            propInfo.isStatic = false;
          }
        }
      });
    });

    Object.entries(propertyTracker).forEach(([key, propInfo]) => {
      if (propInfo.count === 1) {
        singleClassProps.push(key);
        return;
      }
      if (propInfo.isStatic) {
        staticProps.push(key);
        return;
      }
      if (propInfo.count === subclassList.length) {
        universalProps.push(key);
      }
      else {
        specializedProps.push(key);
      }
    });

    meta.categories[category] = {
      superclassCount: superclassList.length,
      superclasses: superclassList,
      subclassCount: subclassList.length,
      subclasses: subclassList,
      universalProps,
      specializedProps,
      singleClassProps,
      staticProps,
    };
  });

  return meta;
}
