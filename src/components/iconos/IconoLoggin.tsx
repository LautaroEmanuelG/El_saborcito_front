interface IconoLogginProps {
  color: string;
}

const IconoLoggin: React.FC<IconoLogginProps> = ({ color}) => {
  return (
    <svg
      width="45"
      height="44"
      viewBox="0 0 45 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 32V30C30 28.9391 29.5786 27.9217 28.8284 27.1716C28.0783 26.4214 27.0609 26 26 26H20C18.9391 26 17.9217 26.4214 17.1716 27.1716C16.4214 27.9217 16 28.9391 16 30V32"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 22C25.2091 22 27 20.2091 27 18C27 15.7909 25.2091 14 23 14C20.7909 14 19 15.7909 19 18C19 20.2091 20.7909 22 23 22Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconoLoggin;
