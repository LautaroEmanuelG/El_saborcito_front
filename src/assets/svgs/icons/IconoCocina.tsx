import React from 'react';

const IconoCocina = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon icon-tabler icons-tabler-outline icon-tabler-tools-kitchen ${className}`}
  >
    {' '}
    <path stroke="none" d="M0 0h24v24H0z" fill="none" /> <path d="M4 3h8l-1 9h-6z" />{' '}
    <path d="M7 18h2v3h-2z" /> <path d="M20 3v12h-5c-.023 -3.681 .184 -7.406 5 -12z" />{' '}
    <path d="M20 15v6h-1v-3" /> <path d="M8 12l0 6" />
  </svg>
);

export default IconoCocina;
