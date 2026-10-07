class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || this.currentOperand === '0') {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.currentOperand = '0';
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // fix decimals
        computation = Math.round(computation * 1000000000) / 1000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            let opSymbol = this.operation;
            if (opSymbol === '*') opSymbol = '×';
            if (opSymbol === '/') opSymbol = '÷';
            
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // using event delegation for buttons
    document.querySelector('.buttons').addEventListener('click', (e) => {
        const target = e.target;
        if (!target.matches('button')) return;

        if (target.classList.contains('number')) {
            calculator.appendNumber(target.dataset.value);
            calculator.updateDisplay();
        } else if (target.dataset.action === 'operator') {
            calculator.chooseOperation(target.dataset.value);
            calculator.updateDisplay();
        } else if (target.dataset.action === 'calculate') {
            calculator.compute();
            calculator.updateDisplay();
        } else if (target.dataset.action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
        } else if (target.dataset.action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        }
    });
});