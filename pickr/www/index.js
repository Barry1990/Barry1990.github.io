const pickrContainer = document.querySelector('.pickr-container');
const themeContainer = document.querySelector('.theme-container');
const themes = [
    [
        'tenda',
        {
            swatches: [
                'rgba(244, 67, 54, 1)',
                'rgba(156, 39, 176, 0.9)',
                'rgba(63, 81, 181, 0.8)',
                'rgba(3, 169, 244, 0.7)',
                'rgba(0, 150, 136, 0.75)',
                'rgba(139, 195, 74, 0.85)',
                'rgba(255, 235, 59, 0.95)'
            ],
            historys: [
            ],
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    input: true,
                    save: true
                }
            }
        }
    ]
];

const buttons = [];
let pickr = null;

for (const [theme, config] of themes) {
    const button = document.createElement('button');
    button.innerHTML = theme;
    buttons.push(button);

    button.addEventListener('click', () => {
        const el = document.createElement('p');
        pickrContainer.appendChild(el);

        // Delete previous instance
        if (pickr) {
            pickr.destroyAndRemove();
        }

        // Apply active class
        for (const btn of buttons) {
            btn.classList[btn === button ? 'add' : 'remove']('active');
        }

        // Create fresh instance
        pickr = new Pickr(Object.assign({
            el, theme,
            default: '#42445a'
        }, config));

        // Set events
        pickr.on('init', instance => {
            console.log('Event: "init"', instance);
        }).on('hide', instance => {
            console.log('Event: "hide"', instance);
        }).on('show', (color, instance) => {
            console.log('Event: "show"', color, instance);
        }).on('save', (color, instance) => {
            console.log('Event: "save"', color, instance);
        }).on('clear', instance => {
            console.log('Event: "clear"', instance);
        }).on('change', (color, source, instance) => {
            console.log('Event: "change"', color, source, instance);
        }).on('changestop', (source, instance) => {
            console.log('Event: "changestop"', source, instance);
        }).on('cancel', instance => {
            console.log('cancel', pickr.getColor().toRGBA().toString(0));
        }).on('swatchselect', (color, instance) => {
            console.log('Event: "swatchselect"', color, instance);
        });
    });

    themeContainer.appendChild(button);
}

buttons[0].click();
