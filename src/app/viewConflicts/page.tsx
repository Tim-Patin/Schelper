'use client';

import { CiCircleCheck } from "react-icons/ci";

const ViewConflicts = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="text-center text-gray-400 flex flex-row items-center gap-1">
                <p>No Conflicts</p>
                <CiCircleCheck />
            </div>
        </div>
    );
}

export default ViewConflicts;