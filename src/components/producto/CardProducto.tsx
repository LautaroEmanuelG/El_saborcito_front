type ProductProps = {
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
    addToCart: (product: any) => void;
  };
  
  export const CardProducto = ({ product, addToCart }: ProductProps) => {
    return (
      <div
        key={product.id}
        className="bg-white rounded-lg shadow-lg overflow-hidden border"
        style={{ width: '310px' }}
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="p-4 flex justify-between items-center">
          <button
            className="text-white rounded"
            style={{ backgroundColor: '#E11D48', width: '274px', height: '60px' }}
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
        <div className="p-4 text-left">
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-gray-500">${product.price.toFixed(2)}</p>
        </div>
      </div>
    );
  };
  
  
