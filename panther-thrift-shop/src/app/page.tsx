import Image from "next/image";
import React from "react";
import MaxWidthWrapper from '@/app/components/MaxWidthWrapper';
import NavBar from '@/app/components/Navbar'; // Import the NavBar component

export default function Home() {
  return (
      <div className="bg-slate-50 grainy-light">
        {/* Include the NavBar at the top */}
        <NavBar />
        <section>
          <MaxWidthWrapper className="pb-24 pt-10 lg:grid lg:grid-cols-3 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-24 xl:pt-32 lg:pb-52">
            <div className="col-span-2 px-6 lg:px-0 lg:pt-4">
              <div className="relative mx-auto text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="absolute w-28 left-0 -top-20 hidden lg:block">
                  {/* Purely visual gradient */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t via-slate-50/50 from-slate-50 h-28" />
                </div>
                <h1 className="relative w-fit tracking-tight text-balance mt-16 font-bold !leading-tight text-gray-900 text-5xl md:text-6xl lg:text-7xl">
                  <span className="bg-red-600 px-2 text-white">Panther</span>{' '}
                  Thrift Shop{' '}
                </h1>
                <p className="mt-8 text-lg lg:pr-10 max-w-prose text-center lg:text-left text-balance md:text-wrap">
                  Hanover College trusted <span className="font-semibold">Buy-and-sell</span> Web Application
                </p>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>
      </div>
  );
}
