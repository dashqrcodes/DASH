export default function ProductPreview() {
  return (
    <section className="section product">
      <div className="product__frame">
        <div
          className="product__image"
          role="presentation"
          style={{
            backgroundImage: 'url(/images/78260C74-D385-45C8-8D2F-F7923ECB60A2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="product__badge">Create</div>
      </div>
      <div className="product__glow" />
    </section>
  );
}

