interface IconoCarritoProps {
  color: string;
}

const IconoCarrito: React.FC<IconoCarritoProps> = ({ color }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <svg
        width="24"
        height="17"
        viewBox="0 0 24 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.82886 1.76001H3.8733L6.59241 13.904C6.69216 14.3488 6.95088 14.7463 7.32403 15.0283C7.69718 15.3103 8.16143 15.459 8.63686 15.4489H18.6342C19.0995 15.4482 19.5506 15.2957 19.913 15.0166C20.2754 14.7375 20.5275 14.3484 20.6275 13.9138L22.3142 6.6489H4.96708"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <path
        d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconoCarrito;
