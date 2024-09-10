type Props = {
  category: {
    id: number;
    nombre: string;
  };
};

export const BtnCategoria = ({ category }: Props) => {
  return (
    <a
      key={category.id}
      href="#"
      className="text-lg font-medium hover:text-primary transition-colors">
      {category.nombre}
    </a>
  );
};
