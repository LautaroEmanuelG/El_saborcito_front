import { useNavigate, useLocation } from 'react-router-dom';
import IconoVolverAtras from '../../../../assets/svgs/icons/IconoVolverAtras';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = '' }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname === '/admin') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Volver atrás"
      className={`flex items-center justify-center h-10 w-10 mr-4 rounded hover:bg-white/10 transition ${className}`}
      type="button"
    >
      <IconoVolverAtras className="h-10 w-10" />
    </button>
  );
};

export default BackButton;
