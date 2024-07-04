import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {

const [image, setImage] = useState(false);
const [productDetails, setProductDetails] = useState({
  name: '',
  category: 'women',
  image: '',
  old_price: '',
  new_price: '',
  description: '',
});

const imageHandler = (e) => {
  setImage(e.target.files[0]);
}
const changeHandler = (e) => {
  setProductDetails({...productDetails, [e.target.name]: e.target.value});
}
const Add_Product = async () => {
  console.log(productDetails);
  let responseData;
  let product = productDetails;

  let formData = new FormData();
  formData.append('product', image);

  await fetch('http://localhost:4000/upload', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  }).then((resp) =>resp.json()).then((data) => {responseData=data})
  if(responseData.success)
    {
    product.image = responseData.image_url;
    console.log(product);
    await fetch('http://localhost:4000/addproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    }).then((resp) => resp.json()).then((data) => {
      // data.success?alert("Product Added Successfully"):alert("Something went wrong");
      if (data.success) {
        alert('Product Added Successfully');
        window.location.reload(); // Reload the page after successful product addition
      } else {
        alert('Something went wrong');
      }
    })
    }
}

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here'/>
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>M.R.P Price</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here'/>
        </div>
        <div className="addproduct-itemfield">
          <p>Rental Price</p>
          <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here'/>
        </div>
      </div>
        <div className="addproduct-itemfield">
          <p>Product Category</p>
          <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Drapery</option>
            <option value="accessory">Accessories</option>
          </select>
        </div>
        <div className="addproduct-itemfield">
          <label htmlFor='file-input'>
            <img src={image?URL.createObjectURL(image):upload_area} alt="" className='addproduct-thumbnail-img' />
          </label>
          <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
        </div>
        <div className="addproduct-itemfield-desc">
          <p>Description</p>
          <textarea value={productDetails.description} onChange={changeHandler} name="description" id="" ></textarea>
          {/* <input value={productDetails.description} onChange={changeHandler} name="description" id="" ></input> */}
        </div>
          <button onClick={()=>Add_Product()} className='addproduct-btn'>Add Product</button>
    </div>
    
  )
}

export default AddProduct
