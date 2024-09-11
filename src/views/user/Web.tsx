import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { CardProducto } from '../../components/producto/CardPruducto';

const product = {
  id: 1,
  name: "Pizza Fugazzeta",
  price: 499.99,
  image: "/ruta-de-la-imagen.png",
};

const addToCart = (product: any) => {
  console.log(`Producto agregado al carrito: ${product.name}`);
};

type Props = {};

export const Web = ({}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <Header totalItems={0} />
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
        <ListaCategorias />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
        <CardProducto product={product} addToCart={addToCart} />
      </div>
    </div>
  );
};
