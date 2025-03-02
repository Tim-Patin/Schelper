'use client';

import React, { useState, useEffect } from "react";
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import logo from '../lib/icons';
// import { useRouter } from 'next/navigation';
import Link from "next/link";

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState("/wcispsu.jpg");
    // const router = useRouter();

    useEffect(() => {
        const images = ["/wcispsu.jpg", "/NittanyLionShrine.jpg", "/PSU_Light_Dark.jpg"];
        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % images.length;
            setBackgroundUrl(images[index]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='flex flex-col'>
            <div className="bg-center bg-cover h-screen max-w-screen flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
                style={{ backgroundImage: `url(${backgroundUrl})` }}>
                <div className='text-center backdrop-blur-[1px] p-8'>
                    <h1 className='text-lightblue text-8xl font-bold flex items-center justify-center gap-4'>
                        <Image src={logo} height={55} alt="Schelper Icon" />
                        Schelper
                    </h1>
                    <h2 className='pt-4 text-3xl text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
                    <div className='mt-10 flex justify-center gap-6'>
                        <Link className="relative group overflow-hidden"
                            href='/calendar'>
                            <Image
                                src="/calendar1.png"
                                alt="Edit Calendar"
                                width={160}
                                height={64}
                                className="cursor-pointer transition rounded-lg"
                            />
                            <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                Edit Calendar
                            </span>
                        </Link>
                        <Link className="relative group"
                            href='/tags'>
                            <Image
                                src="/tag.png"
                                alt="Manage Tags"
                                width={160}
                                height={64}
                                className="cursor-pointer transition rounded-lg"
                            />
                            <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                Manage Tags
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
