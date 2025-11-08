// script.js — client-side behavior & validation

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donationForm');

  // Elements for special interactions
  const otherAmountRadio = Array.from(document.getElementsByName('amount')).find(r=>r.value==='other');
  const otherAmountInput = document.getElementById('otherAmount');
  const amountRadios = Array.from(document.getElementsByName('amount'));
  const recurringCheckbox = document.getElementById('recurring');
  const recurringFields = document.getElementById('recurringFields');

  // Enable/disable Other amount input depending on radio selection
  function updateOtherAmountState() {
    const selected = amountRadios.find(r=>r.checked);
    if (selected && selected.value === 'other') {
      otherAmountInput.disabled = false;
      otherAmountInput.focus();
    } else {
      otherAmountInput.value = '';
      otherAmountInput.disabled = true;
    }
  }
  amountRadios.forEach(r=> r.addEventListener('change', updateOtherAmountState));
  updateOtherAmountState();

  // Toggle recurring fields
  recurringCheckbox.addEventListener('change', () => {
    if (recurringCheckbox.checked) {
      recurringFields.classList.remove('hidden');
    } else {
      recurringFields.classList.add('hidden');
      // clear fields inside recurringFields for safety
      recurringFields.querySelectorAll('input,select').forEach(i => { i.value = ''; });
    }
  });

  // Basic validation helpers
  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showErrors(errors) {
    // For simplicity show an alert with errors — in production, show inline messages.
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
  }

  // On submit: validate and show summary
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = [];

    // Required: firstName, lastName, address1, email
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const address1 = form.address1.value.trim();
    const email = form.email.value.trim();

    if (!firstName) errors.push('First name is required.');
    if (!lastName) errors.push('Last name is required.');
    if (!address1) errors.push('Address 1 is required.');
    if (!email) errors.push('Email is required.');
    else if (!isEmailValid(email)) errors.push('Enter a valid email address.');

    // Donation amount validation: if 'other' selected, require > 0
    const selectedAmount = amountRadios.find(r=>r.checked)?.value || '0';
    let amountForSummary = 'None';
    if (selectedAmount === 'other') {
      const v = parseFloat(otherAmountInput.value);
      if (isNaN(v) || v <= 0) errors.push('Enter a valid Other Amount greater than 0.');
      else amountForSummary = `$${v.toFixed(2)}`;
    } else if (selectedAmount && Number(selectedAmount) > 0) {
      amountForSummary = `$${Number(selectedAmount).toFixed(2)}`;
    }

    // If recurring and CC provided, simple check
    if (recurringCheckbox.checked) {
      const cc = form.ccNumber.value.trim();
      if (!cc) errors.push('Credit card number is required for recurring donations.');
      // very basic numeric check
      else if (!/^\d{13,19}$/.test(cc.replace(/\s+/g,''))) {
        errors.push('Enter a valid credit card number (13-19 digits).');
      }
    }

    if (errors.length) {
      showErrors(errors);
      return;
    }

    // Build summary of entered data
    const summary = {
      'Name': `${firstName} ${lastName}`,
      'Email': email,
      'Address': address1 + (form.address2.value ? ', ' + form.address2.value : ''),
      'City': form.city.value || '—',
      'State': form.state.value || '—',
      'Country': form.country.value || '—',
      'Phone': form.phone.value || '—',
      'Donation Amount': amountForSummary,
      'Recurring': recurringCheckbox.checked ? (`Yes (${form.recCycle.value || 'monthly'}, for ${form.recMonths.value || 'N/A'} months)`) : 'No'
    };

    // Display confirmation dialog (summary)
    let msg = 'Please confirm your donation details:\n\n';
    for (const k in summary) {
      msg += `${k}: ${summary[k]}\n`;
    }
    msg += '\nClick OK to submit (this demo will not send data).';

    if (confirm(msg)) {
      alert('Thank you! Your donation form has been (locally) submitted. In a real app the data would now be sent to the server.');
      form.reset();
      updateOtherAmountState();
      recurringFields.classList.add('hidden');
    }
  });

  // Reset handler to hide recurring and other amount when cleared
  form.addEventListener('reset', () => {
    setTimeout(() => {
      updateOtherAmountState();
      recurringFields.classList.add('hidden');
    }, 0);
  });
});