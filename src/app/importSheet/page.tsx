"use client";

import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { newDefaultEmptyClass } from '@/lib/common';
import { CombinedClass } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import xlsx from 'xlsx';

const convertTime = (excelTimeString: string) => {
    const timeComponents = excelTimeString.split(' ');
    const numberComponent = timeComponents[0];
    const ampm = timeComponents[1];

    if (ampm.trim().toLowerCase() === 'am') {
        return numberComponent;
    } else {
        const t = numberComponent.split(':');
        const hour = parseInt(t[0]) + 12;
        return hour + ':' + t[1];
    }
}

const ImportSheet = () => {
    // const [file, setFile] = useState<File | null>(null);
    const router = useRouter();
    const { uploadNewClasses } = useCalendarContext();
    const [parsedClasses, setParsedClasses] = useState<CombinedClass[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // setFile(selectedFile);

        // Process the file immediately
        const data = await selectedFile.arrayBuffer();
        const workbook = xlsx.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { range: 1 }) as object[][];

        const combinedClasses = [] as CombinedClass[];

        rows.values().forEach((element: object[]) => {
            const combinedClass = newDefaultEmptyClass();
            const classData = combinedClass.classData;
            const classProperties = combinedClass.classProperties;
            let isCancelled = false;

            Object.keys(element).forEach(key => {
                const value = String(element[key as keyof typeof element]);
                if (value) {
                    switch (key) {
                        // Class
                        case "Catalog #":
                            classData.catalog_num = value;
                            break;
                        case "Class #":
                            classData.class_num = value;
                            break;
                        case "Session":
                            classData.session = value;
                            break;
                        case "Course":
                            classData.course_subject = value;
                            break;
                        case "Num":
                            const val = value.trim();
                            const match = val.match(/^\d+/);
                            if (match) {
                                const numbers = Number(match);
                                if (!isNaN(numbers)) {
                                    switch (Math.floor(numbers / 100)) {
                                        case 1:
                                            classProperties.tags.push("100level");
                                            break;
                                        case 2:
                                            classProperties.tags.push("200level");
                                            break;
                                        case 3:
                                            classProperties.tags.push("300level");
                                            break;
                                        case 4:
                                            classProperties.tags.push("400level");
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            classData.course_num = val;
                            break;
                        case "Section":
                            classData.section = value;
                            break;
                        case "Title":
                            classData.title = value;
                            break;
                        case "Location":
                            classData.location = value;
                            break;
                        case "Enr Cpcty":
                            classData.enrollment_cap = value;
                            break;
                        case "Wait Cap":
                            classData.waitlist_cap = value;
                            break;

                        // Class Property
                        case "Class Stat":
                            classProperties.class_status = value;
                            if (value === "Cancelled Section") {
                                isCancelled = true;
                            }
                            break;
                        case "Start":
                            classProperties.start_time = convertTime(value);
                            break;
                        case "End":
                            classProperties.end_time = convertTime(value);
                            break;
                        case "Room":
                            classProperties.room = value;
                            break;
                        case "Facility ID":
                            classProperties.facility_id = value;
                            break;
                        case "M":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Mon");
                            break;
                        case "T":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Tue");
                            break;
                        case "W":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Wed");
                            break;
                        case "R":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Thu");
                            break;
                        case "F":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Fri");
                            break;
                        case "Instructor Email":
                            classProperties.instructor_email = value;
                            break;
                        case "Instructor Name":
                            classProperties.instructor_name = value;
                            break;
                        case "Tot Enrl":
                            classProperties.total_enrolled = value;
                            break;
                        case "Wait Tot":
                            classProperties.total_waitlisted = value;
                            break;
                        default:
                            break;
                    }
                }
            });

            if (!isCancelled) {
                combinedClasses.push(combinedClass);
            }
        });

        setParsedClasses(combinedClasses);
        // Initially select all classes
        setSelectedClasses(new Set(combinedClasses.map(c => c.classData.class_num)));
    };

    const handleImport = () => {
        const classesToImport = parsedClasses.filter(c =>
            selectedClasses.has(c.classData.class_num)
        );
        uploadNewClasses(classesToImport);
        router.back();
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Import Sheet</h1>
            <div className="space-y-4">
                <div className='max-h-fit'>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            </div>

            {parsedClasses.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Classes to Import ({parsedClasses.length})</h2>
                        <button
                            onClick={handleImport}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            data-testid="import-selected-classes"
                        >
                            Import Selected Classes ({selectedClasses.size})
                        </button>
                    </div>
                    <div className="overflow-auto max-h-[60vh]">
                        <table className="min-w-full border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 border">
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.size === parsedClasses.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedClasses(new Set(parsedClasses.map(c => c.classData.class_num)));
                                                } else {
                                                    setSelectedClasses(new Set());
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="p-2 border">Class #</th>
                                    <th className="p-2 border">Course</th>
                                    <th className="p-2 border">Title</th>
                                    <th className="p-2 border">Days</th>
                                    <th className="p-2 border">Time</th>
                                    <th className="p-2 border">Instructor</th>
                                    <th className="p-2 border">Room</th>
                                    <th className="p-2 border">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedClasses.map((cls) => (
                                    <tr
                                        key={`${cls.classData.class_num}-${cls.classData.course_subject + cls.classData.course_num}-${cls.classData.section}-${cls.classProperties.instructor_email}-${cls.classProperties.room}-${cls.classProperties.start_time + "-" + cls.classProperties.end_time}-${cls.classProperties.days.join(",")}-${cls.classProperties.class_status}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="p-2 border">
                                            <input
                                                type="checkbox"
                                                checked={selectedClasses.has(cls.classData.class_num)}
                                                onChange={(e) => {
                                                    const newSelected = new Set(selectedClasses);
                                                    if (e.target.checked) {
                                                        newSelected.add(cls.classData.class_num);
                                                    } else {
                                                        newSelected.delete(cls.classData.class_num);
                                                    }
                                                    setSelectedClasses(newSelected);
                                                }}
                                            />
                                        </td>
                                        <td className="p-2 border">{cls.classData.class_num}</td>
                                        <td className="p-2 border">
                                            {cls.classData.course_subject} {cls.classData.course_num}
                                        </td>
                                        <td className="p-2 border">{cls.classData.title}</td>
                                        <td className="p-2 border">{cls.classProperties.days.join(', ')}</td>
                                        <td className="p-2 border">
                                            {cls.classProperties.start_time} - {cls.classProperties.end_time}
                                        </td>
                                        <td className="p-2 border">{cls.classProperties.instructor_name}</td>
                                        <td className="p-2 border">{cls.classProperties.room}</td>
                                        <td className="p-2 border">{cls.classData.location}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportSheet;