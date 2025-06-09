import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  // className opcional ya que SVGProps lo incluye, pero siendo explícitos para claridad.
}

const IconoChevronsRight: React.FC<IconProps> = (props) => (
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
    {...props} // Pasa todas las props, incluyendo className
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 7l5 5l-5 5" />
    <path d="M13 7l5 5l-5 5" />
  </svg>
);

export default IconoChevronsRight;
