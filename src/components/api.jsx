const API_URL = "http://localhost/your-project-path/category_items.php";

export const fetchCategories = () =>
  fetch(`${API_URL}?action=get_categories`).then(res => res.json());

export const addCategory = data =>
  fetch(API_URL, {
    method: "POST",
    body: data,
  }).then(res => res.json());

export const updateCategory = data =>
  fetch(API_URL, {
    method: "POST",
    body: data,
  }).then(res => res.json());

export const deleteCategory = id =>
  fetch(`${API_URL}?action=delete_category&id=${id}`).then(res => res.json());

export const fetchItems = () =>
  fetch(`${API_URL}?action=get_items`).then(res => res.json());

export const addItem = data =>
  fetch(API_URL, {
    method: "POST",
    body: data,
  }).then(res => res.json());

export const updateItem = data =>
  fetch(API_URL, {
    method: "POST",
    body: data,
  }).then(res => res.json());

export const deleteItem = id =>
  fetch(`${API_URL}?action=delete_item&id=${id}`).then(res => res.json());

export const deleteImage = id =>
  fetch(`${API_URL}?action=delete_image&id=${id}`).then(res => res.json());
