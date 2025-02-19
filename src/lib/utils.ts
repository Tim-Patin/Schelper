import { Class, ClassProperty, CombinedClass, tagType } from "./types";

// FETCH
export default async function fetchWithTimeout(requestURL: string, options = {}, timeout = 5000) {
    const controller = new AbortController();
    let response: Response;

    setTimeout(() => controller.abort(), timeout);

    if (!requestURL) {
        console.log("options\n" + options);
        response = new Response(null, { status: 408 });
    } else {
        try {
            response = await fetch(requestURL, {
                ...options,
                signal: controller.signal,
            });
        } catch (error) {
            console.log(error);
            response = new Response(null, { status: 408 });
        }
    }

    return response;
}

// LOADS/GETs
// Get all tags
export async function loadAllTags(): Promise<tagType[]> {
    const response = await fetchWithTimeout("./api/tags", {
        headers: {},
    });

    if (!response.ok || response.status != 200 || !response.body) {
        console.error("Could not find tags!");
        return [];
    }

    const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
    const tagsJSON = JSON.parse(responseText);
    return tagsJSON as { id: string; name: string }[];
}

// Editable Class Properties.
export async function loadClassProperties(classId: string): Promise<ClassProperty> {
    const propertiesResponse = await fetchWithTimeout("./api/class_properties", {
        headers: {
            id: classId,
        },
    });

    if (!propertiesResponse.ok || propertiesResponse.status != 200 || !propertiesResponse.body) {
        console.error("Couldn't find class property!");
        return new Object() as ClassProperty;
    }

    const propertiesResponseText = new TextDecoder().decode((await propertiesResponse.body.getReader().read()).value);

    if (propertiesResponseText === "" || typeof propertiesResponseText === undefined) {
        console.warn("Invalid JSON response from class_properties, returning empty properties");
        return new Object() as ClassProperty;
    }

    return JSON.parse(propertiesResponseText) as ClassProperty;
}

// Load from two collections
export async function loadCombinedClass(classId: string): Promise<CombinedClass> {
    const classResponse = await fetchWithTimeout("./api/classes", {
        headers: {
            id: classId,
        },
    });

    const combinedClass = {} as CombinedClass;

    if (!classResponse.ok || classResponse.status != 200 || !classResponse.body) {
        console.error("Could not find class!");
        return {} as CombinedClass;
    }

    const classResponseText = new TextDecoder().decode((await classResponse.body.getReader().read()).value);
    const classJSON = JSON.parse(classResponseText);
    const newClass = classJSON as Class;
    combinedClass.classData = newClass;

    // Getting the class property
    const newProperties: ClassProperty = await loadClassProperties(classId);

    // Combining the class property
    combinedClass.classProperties = newProperties;

    return combinedClass;
}

//
export async function loadCombinedClasses(classIds: string[]): Promise<CombinedClass[]> {
    const classData: CombinedClass[] = [];

    for (let i = 0; i < classIds.length; i++) {
        const newClass: CombinedClass | null = await loadCombinedClass(classIds[i]);

        if (newClass) {
            classData.push(newClass);
        }
    }

    return classData;
}

export async function loadAllCombinedClasses(): Promise<CombinedClass[]> {
    const response = await fetchWithTimeout("./api/classes", {
        headers: {},
    });

    if (!response.ok || response.status != 200 || !response.body) {
        console.error("Could not find classes!\n");
        console.log(response);
        if (response.ok) {
            console.log(response.statusText + "ok");
        }
        console.log("status: " + response.status);

        // if (response.body) {
        //     console.log("body" + response.body);
        // }

        return new Object() as CombinedClass[];
    }

    const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
    const classesJSON = JSON.parse(responseText);
    const newClasses = classesJSON as Class[];

    const newCombined = [] as CombinedClass[];

    // console.log(JSON.stringify(newClasses) + "\n");

    for (const classItem of newClasses) {
        const propResponse = await fetchWithTimeout("./api/class_properties", {
            headers: { id: classItem._id.toString() },
        });

        // Read entire response as text first
        const propText = await propResponse.text();

        if (!propResponse.ok || !propText || propText.trim().length === 0) {
            console.error("Couldn't retrieve property for id:", classItem._id.toString());
            continue; // Skip this iteration if there's no property data
        }

        // Otherwise, parse the text
        const classProperty = JSON.parse(propText) as ClassProperty;

        newCombined.push({
            classData: classItem,
            classProperties: classProperty,
            event: undefined,
        });
    }

    // console.log(JSON.stringify(newCombined) + "\n");

    return newCombined;
}

// DELETES
export async function deleteClass(classID: string) {
    console.log("deleting " + classID);
}

// INSERTs/POSTs

// Insert class
// Include try catch maybe
export async function insertClass(classData: Class): Promise<string | null> {
    const response = await fetchWithTimeout("api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
    });

    if (!response.ok) {
        console.error("Error inserting class: " + response.statusText);
        return null;
    }

    const result = await response.json();
    return result.insertedId ?? null;
}

// Insert class_property
// Include try catch maybe
export async function insertClassProperty(classProperties: ClassProperty) {
    const response = await fetchWithTimeout("api/class_properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classProperties),
    });

    if (!response.ok) {
        console.error("Error inserting class: " + response.statusText);
        return null;
    }

    const result = await response.json();
    return result.insertedId ?? null;
}

// Insert combined class
export async function insertCombinedClass(combinedClass: CombinedClass) {
    const classId = await insertClass(combinedClass.classData);

    if (classId == null) {
        console.error("Failed to insert class");
        return;
    } else {
        console.log(classId + " : Inserted class successfully!\n");
    }
    combinedClass.classProperties._id = classId;
    const classPropId = await insertClassProperty(combinedClass.classProperties);

    if (classPropId == null) {
        console.error("Failed to insert class properties. Try again...");
    } else {
        console.log(classPropId + " : Inserted class properties successfully!\n");
    }
}

// Insert tag
export async function insertTag(tagName: string) {
    const response = await fetchWithTimeout("api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
    });

    if (!response.ok) {
        console.error("Error inserting tag: " + response.statusText);
        return null;
    }

    const result = await response.json();
    return result.insertedId ?? null;
}

// --------
// PUTS/UPDATES

export async function updateCombinedClass(combinedClass: CombinedClass) {
    console.log("Updating class: " + combinedClass.classData._id);
    const classResponse = await fetchWithTimeout("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedClass.classData),
    });

    if (!classResponse.ok) {
        console.error("Error updating class: " + classResponse.statusText);
        return;
    }

    const classPropResponse = await fetchWithTimeout("/api/class_properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedClass.classProperties),
    });

    if (!classPropResponse.ok) {
        console.error("Error updating class properties: " + classPropResponse.statusText);
        return;
    }
}
