import React from "react";
import Carousel from "react-bootstrap/Carousel";

const Item = ({ items, onEdit, onDelete }) => {
  return (
    <div className="item-grid">
      {items.map((item) => (
        <div key={item.id} className="item-card">
          <Carousel>
            {item.images.map((img, i) => (
              <Carousel.Item key={i}>
                <img src={img} className="d-block w-100" alt="Item Image" />
              </Carousel.Item>
            ))}
          </Carousel>
          <h4>{item.name}</h4>
          <p>Price: ₹{item.price}</p>
          <button onClick={() => onEdit(item)}>Edit</button>
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Item;
