import { EventInput } from "@fullcalendar/core/index.js";
import { ReactNode } from "react";

export type tagListType = Map<string, { classIds: Set<string> }>;

export type Class = {
    // unchanging identifiers
    _id: string;
    catalog_num: string;
    class_num: string;
    session: string;
    course_subject: string;
    course_num: string;
    section: string;
    title: string;
    location: string;
    enrollment_cap: string;
    waitlist_cap: string;
};

export type ClassProperty = {
    // editable properties
    _id: string;
    class_status: string;
    start_time: string;
    end_time: string;
    room: string;
    facility_id: string;
    days: string[];
    instructor_email: string;
    instructor_name: string;
    total_enrolled: string;
    total_waitlisted: string;
    tags: string[];
};

export type CombinedClass = {
    classData: Class;
    classProperties: ClassProperty;
    event: EventInput | undefined;
};

export type DropDownProps = {
    /** Function to render the button content */
    renderButton: (isOpen: boolean) => ReactNode;
    /** Function to render the dropdown content */
    renderDropdown: () => ReactNode;
    /** Additional class names */
    buttonClassName?: string;
    dropdownClassName?: string;
};

export type ButtonDropDownProps = {
    title: string;
    items: { link: string; content: string }[];
    type: string;
};

export type FullCalendarClassEvent = {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
};

export type CalendarOpenProps = {
    toggleCalendar: (isOpen: boolean) => void;
};

export type ProviderProps = {
    children: ReactNode;
};

export type ConflictType = {
    class1: CombinedClass;
    class2: CombinedClass;
};

export type CalendarContextType = {
    isLoading: boolean;
    error: string | null;
    currentCombinedClass?: CombinedClass | undefined;
    setCurrentClass: (newCombinedClass: CombinedClass) => void;
    updateOneClass: (combinedClassToUpdate: CombinedClass) => void;
    allClasses: CombinedClass[];
    updateAllClasses: (newClasses: CombinedClass[], updateEvents?: boolean) => void;
    displayClasses: CombinedClass[];
    updateDisplayClasses: (newDisplayClasses: CombinedClass[], updateEvents?: boolean) => void;
    allEvents: EventInput[];
    displayEvents: EventInput[];
    tagList: tagListType; // Map of tags to a set of class ids
    allTags: Set<string>;
    unlinkTagFromClass: (classId: string, tagId: string) => void;
    unlinkAllTagsFromClass: (classId: string) => void;
    unlinkAllClassesFromTag: (tagId: string) => void;
    unlinkAllTagsFromAllClasses: () => void;
    detectConflicts: () => void;
    conflicts: ConflictType[];
    uploadNewClasses: (uploadedClasses: CombinedClass[]) => void;
};

export type CalendarState = {
    classes: {
        all: CombinedClass[];
        display: CombinedClass[];
        current: CombinedClass | undefined;
    };
    events: {
        all: EventInput[];
        display: EventInput[];
    };
    tags: {
        all: Set<string>;
        mapping: tagListType;
    };
    status: {
        loading: boolean;
        error: string | null;
    };
    conflicts: ConflictType[];
};
