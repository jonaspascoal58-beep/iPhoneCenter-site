const form = document.getElementById("leadForm");
const statusBox = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.className = "status";
  statusBox.textContent = "Enviando…";

  const fd = new FormData(form);
  const payload = {
    name: fd.get("name"),
    phone: fd.get("phone"),
    email: fd.get("email"),
    product: fd.get("product"),
    deliveryCity: fd.get("deliveryCity"),
    message: fd.get("message"),
    consent: fd.get("consent") === "on"
  };

  try {
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Erro ao enviar.");
    statusBox.className = "status success";
    statusBox.textContent = "Solicitação enviada com sucesso. A equipe poderá entrar em contato.";
    form.reset();
  } catch (err) {
    statusBox.className = "status error";
    statusBox.textContent = err.message;
  }
});

function selectProduct(button) {
  const card = button.closest(".card");
  if (!card) return;

  const title = card.querySelector("h3");
  const capacity = card.querySelector("p");
  const price = card.querySelector("strong");
  const select = document.querySelector('select[name="product"]');

  if (!title || !select) return;

  const product = title.textContent.trim();
  const storage = capacity ? capacity.textContent.trim() : "";
  const value = price ? price.textContent.trim() : "";

  const completeProduct = [product, storage, value]
    .filter(Boolean)
    .join(" — ");

  let option = Array.from(select.options).find(
    option => option.value === completeProduct
  );

  if (!option) {
    option = document.createElement("option");
    option.value = completeProduct;
    option.textContent = completeProduct;
    select.appendChild(option);
  }

  select.value = completeProduct;
}
