import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
  const location = useLocation();
  return (
    <main className="page-width py-[60px] md:py-[100px] text-center min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="m-0 mb-[1.5rem] font-heading text-[2.8rem] md:text-[4rem] font-normal text-black capitalize">
        {title || location.pathname.replace(/\//g, ' ').trim()}
      </h1>
      <p className="m-0 mb-[2.5rem] text-[1.6rem] text-black/75 max-w-[50rem]">
        This route (<code>{location.pathname}</code>) is registered and ready for the next phase of development.
      </p>
      <Link to="/" className="lil-button lil-button-pill">
        Back to Homepage
      </Link>
    </main>
  );
}

