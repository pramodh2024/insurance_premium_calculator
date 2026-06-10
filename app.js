const masterData = {
  esc: {
    label: "ESC",
    sumLabel: "ESC - Sum Insured (INR)",
    premiumLabel: "Total Premium (INR)",
    premiumNote: "Premium",
    options: [
      { sumInsured: 150000, premium: 18880 },
      { sumInsured: 200000, premium: 24500 },
      { sumInsured: 300000, premium: 28500 },
      { sumInsured: 500000, premium: 36580 },
      { sumInsured: 700000, premium: 42500 },
      { sumInsured: 1000000, premium: 59000 }
    ]
  },
  parents: {
    label: "Parents",
    sumLabel: "Parents - Sum Insured (INR)",
    premiumLabel: "Premium per Life (INR)",
    premiumNote: "Premium per life",
    options: [
      { sumInsured: 300000, premium: 29500 },
      { sumInsured: 500000, premium: 35400 },
      { sumInsured: 800000, premium: 47200 },
      { sumInsured: 1000000, premium: 59000 }
    ]
  },
  topup: {
    label: "Top-Up",
    sumLabel: "Top-Up - Sum Insured (INR)",
    premiumLabel: "Total Premium (INR)",
    premiumNote: "Premium",
    options: [
      { sumInsured: 100000, premium: 23600 },
      { sumInsured: 200000, premium: 35400 },
      { sumInsured: 300000, premium: 47200 },
      { sumInsured: 400000, premium: 59000 },
      { sumInsured: 500000, premium: 70800 }
    ]
  }
};

const companyBuffer = 10000;
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const selectors = {
  esc: document.getElementById("escSelect"),
  parents: document.getElementById("parentsSelect"),
  topup: document.getElementById("topupSelect")
};
const parentCountInputs = document.querySelectorAll('input[name="parentCount"]');

function money(value) {
  return formatter.format(value);
}

function selectedOption(type) {
  const value = Number(selectors[type].value);
  if (value === 0) return { sumInsured: 0, premium: 0 };
  return masterData[type].options.find((option) => option.sumInsured === value);
}

function populateSelectors() {
  Object.entries(masterData).forEach(([type, group]) => {
    const optionalOption = type === "esc" ? "" : `<option value="0">None - ${money(0)}</option>`;
    selectors[type].innerHTML = optionalOption + group.options.map((option) => (
      `<option value="${option.sumInsured}">${money(option.sumInsured)}</option>`
    )).join("");
  });
}

function renderMasterTables() {
  const tableHost = document.getElementById("masterTables");
  tableHost.innerHTML = Object.values(masterData).map((group) => (
    `<article class="data-card">
      <div class="data-card-head">
        <h3>${group.label}</h3>
        <span>${group.options.length} options</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>${group.sumLabel}</th>
            <th>${group.premiumLabel}</th>
          </tr>
        </thead>
        <tbody>
          ${group.options.map((option) => (
            `<tr>
              <td>${money(option.sumInsured)}</td>
              <td>${money(option.premium)}</td>
            </tr>`
          )).join("")}
        </tbody>
      </table>
    </article>`
  )).join("");

  const totalOptions = Object.values(masterData).reduce((sum, group) => sum + group.options.length, 0);
  document.getElementById("optionCount").textContent = `${totalOptions} master options`;
}

function calculatePremium() {
  const esc = selectedOption("esc");
  const parents = selectedOption("parents");
  const topup = selectedOption("topup");
  const parentCount = Number(document.querySelector('input[name="parentCount"]:checked').value);
  const parentsTotal = parents.premium * parentCount;
  const draftPremium = esc.premium + parentsTotal + topup.premium;
  const ctcImpact = Math.max(draftPremium - companyBuffer, 0);

  document.getElementById("escPremium").textContent = `${masterData.esc.premiumNote}: ${money(esc.premium)}`;
  document.getElementById("parentsPremium").textContent = `${masterData.parents.premiumNote}: ${money(parents.premium)}`;
  document.getElementById("topupPremium").textContent = `${masterData.topup.premiumNote}: ${money(topup.premium)}`;
  document.getElementById("parentCountNote").textContent = parentCount === 2
    ? `Parents premium counted twice: ${money(parents.premium)} x 2 = ${money(parentsTotal)}.`
    : "Parents premium counted once.";
  document.getElementById("draftPremiumNote").textContent = parentCount === 2 && parents.premium > 0
    ? `ESC + Parents (${money(parents.premium)} x 2) + Top-Up`
    : "ESC + Parents + Top-Up";
  document.getElementById("draftPremium").textContent = money(draftPremium);
  document.getElementById("ctcImpact").textContent = money(ctcImpact);
  document.getElementById("finalPremium").textContent = money(ctcImpact);
}

function resetSelections() {
  selectors.esc.value = "150000";
  selectors.parents.value = "0";
  selectors.topup.value = "0";
  document.querySelector('input[name="parentCount"][value="1"]').checked = true;
  calculatePremium();
}

Object.values(selectors).forEach((select) => {
  select.addEventListener("change", calculatePremium);
});

parentCountInputs.forEach((input) => {
  input.addEventListener("change", calculatePremium);
});

document.getElementById("resetBtn").addEventListener("click", resetSelections);

populateSelectors();
renderMasterTables();
resetSelections();
