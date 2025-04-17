import React from "react";
import Carousel from "react-bootstrap/Carousel";

const Banner = ({ items }) => {
  const bannerItems = items.filter((item) => item.status === "1");

  return (
    <Carousel fade>
      {bannerItems.map((item) =>
        item.images.map((img, i) => (
          <Carousel.Item key={`${item.id}-${i}`}>
            <img className="d-block w-100" src={img} alt="Banner" />
            <Carousel.Caption>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))
      )}
    </Carousel>
  );
};

export default Banner;
