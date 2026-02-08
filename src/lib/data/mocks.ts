import { Product } from '@/types';

export const DISCOVER_PRODUCTS: Product[] = [
    {
        id: 'd1',
        name: 'Lagavulin 16 Year Old',
        brand: 'Lagavulin',
        category: 'Whisky',
        abv: '43%',
        volume: '70cl',
        vintage: '16',
        image: 'https://images.vivino.com/thumbs/LqM9Yj7gQ4qQ4q4q4q4q4q_pb_x600.png', // Placeholder
        scannedAt: new Date(),
        producer: {
            name: 'Lagavulin Distillery',
            region: 'Islay, Scotland',
            description: 'Lagavulin is known for its slow distillation speed and pear-shaped pot stills.',
            website: 'https://www.malts.com/en-row/distilleries/lagavulin'
        },
        vivino: {
            score: 4.6,
            reviews: 15000,
            highlights: ['Smoky', 'Peaty', 'Rich']
        }
    },
    {
        id: 'd2',
        name: 'Diplomatico Reserva Exclusiva',
        brand: 'Diplomatico',
        category: 'Rum',
        abv: '40%',
        volume: '70cl',
        image: 'https://images.vivino.com/thumbs/LqM9Yj7gQ4qQ4q4q4q4q4q_pb_x600.png', // Placeholder
        scannedAt: new Date(),
        producer: {
            name: 'Destilerias Unidas S.A.',
            region: 'Venezuela',
            description: 'A blend of exclusive rum reserves aged for up to twelve years.',
            website: 'https://rondiplomatico.com/'
        },
        vivino: {
            score: 4.4,
            reviews: 8500,
            highlights: ['Sweet', 'Vanilla', 'Caramel']
        }
    },
    {
        id: 'd3',
        name: 'Hendrick\'s Gin',
        brand: 'Hendrick\'s',
        category: 'Gin',
        abv: '41.4%',
        volume: '70cl',
        image: 'https://images.vivino.com/thumbs/LqM9Yj7gQ4qQ4q4q4q4q4q_pb_x600.png', // Placeholder
        scannedAt: new Date(),
        producer: {
            name: 'Girvan Distillery',
            region: 'Scotland',
            description: 'Infused with cucumber and rose.',
            website: 'https://www.hendricksgin.com/'
        },
        vivino: {
            score: 4.2,
            reviews: 5000,
            highlights: ['Cucumber', 'Floral', 'Fresh']
        }
    },
    {
        id: 'd4',
        name: 'Chateauneuf-du-Pape',
        brand: 'Domaine de la Janasse',
        category: 'Wijn',
        abv: '14.5%',
        volume: '75cl',
        vintage: '2019',
        image: 'https://images.vivino.com/thumbs/LqM9Yj7gQ4qQ4q4q4q4q4q_pb_x600.png', // Placeholder
        scannedAt: new Date(),
        producer: {
            name: 'Domaine de la Janasse',
            region: 'Rhone, France',
            description: 'Classic Chateauneuf-du-Pape blend.',
            website: 'https://www.lajanasse.com/'
        },
        vivino: {
            score: 4.3,
            reviews: 2000,
            highlights: ['Bold', 'Spicy', 'Red Fruit']
        }
    }
];

export const MOCK_GLENFIDDICH: Product = {
    id: "mock-id",
    name: "Glenfiddich 12 Year Old",
    category: "Single Malt Scotch Whisky",
    brand: "Glenfiddich",
    abv: "40%",
    volume: "70cl",
    vintage: "12",
    image: "https://placehold.co/400x600/png?text=Bottle",
    producer: {
        name: "William Grant & Sons",
        region: "Speyside, Scotland",
        description: "Glenfiddich means 'Valley of the Deer' in Gaelic. The distillery was founded in 1886 by William Grant."
    },
    vivino: {
        score: 4.1,
        reviews: 1250,
        highlights: ["Smooth", "Fruity", "Pear notes"]
    },
    // userScore: undefined, // Removed null assignment to fix TS error
    scannedAt: new Date()
};
