export type MemoryContentType = 'Photo' | 'Text' | 'Both';

export type MemoryCollection = "All" | "Unsorted" | "Wedding" | "Hollywood" | "Daughter" | "Me" | "Europe" | "Awards Show" | "On Set" | "Grandchildren";


export interface Memory {
    id: number;
    title: string;
    caption: string;
    type: MemoryContentType;
    imagePath?: string;
    album?: Exclude<MemoryCollection, 'All' | 'Unsorted'>; 
    event?: string;
    people?: string[];
    location?: string;
    year?: number;
    date?: string;
    color: string;
}

export const collectionNames: MemoryCollection[] = [
    "All", "Unsorted", "Wedding", "Hollywood", "Daughter", "Me", "Europe", "Awards Show", "On Set", "Grandchildren"
];

export const memories: Memory[] =[
    {
        "id": 1,
        "title": "Tippi and Noel in Front of the Chalet",
        "caption": "That was our last trip together; we were trying to make our marriage work but I knew it was over. That entire trip felt like we were trying to fix something that was already over.",
        "album": "Europe",
        "event": "Summer in France",
        "people": [
            "Tippi",
            "Noel"
        ],
        "location": "Normandy, France",
        "year": 1982,
        "date": "1982-07-20 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture2.jpg"
    },
    {
        "id": 2,
        "title": "",
        "caption": "This was a fun session to shoot. Don and Melanie were telling Dakota how they first met. It was crazy how after all this time they had never shared that with her. It took me back to that time watching my daughter become an adult. It was a special and nostalgic moment.",
        "album": "Hollywood",
        "event": "Photoshoot with Hollywood Reporter",
        "people": [
            "Don",
            "Dakota",
            "Tippi",
            "Melanie"
        ],
        "location": "Hollywood Reporter's studio",
        "year": 2017,
        "date": "2017-12-22 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture4.jpg"
    },
    {
        "id": 3,
        "title": "Melanie and Steven Posing Before the Ceremony",
        "caption": "Melanie was nominated that year for her performance in Body Double. I was very proud of her getting recognition for her work. She had worked very hard to get there.",
        "album": "Awards Show",
        "event": "42nd Annual Golden Globe Awards",
        "people": [
            "Melanie",
            "Steven"
        ],
        "location": "Beverly Hilton Hotel, Los Angeles",
        "year": 1985,
        "date": "1985-01-27 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture10.jpg"
    },
    {
        "id": 4,
        "title": "Tippi and Melanie During a Scene Break",
        "caption": "It was the first time Melanie was filming a movie and I was so glad that I got to be next to her the whole way. It was really fun. We would drive together to the studio and then back home, and we would hang out during the breaks too. One of the cameramen took that picture of us while we were relaxing during a break.",
        "album": "On Set",
        "event": "Filming of Night Moves",
        "people": [
            "Tippi",
            "Melanie"
        ],
        "location": "Burbank, California",
        "year": 1973,
        "date": "1973-10",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture13.jpg"
    },
    {
        "id": 5,
        "title": "Alfred Hitchcock and Tippi Getting Out of the Plane",
        "caption": "A little girl had given me a big flower bouquet as soon as I got off the plane.",
        "album": "Awards Show",
        "event": "Arrival to Nice for the Cannes Film Festival to present the film Birds.",
        "people": [
            "Alfred",
            "Tippi"
        ],
        "location": "Nice C\u00f4te d'Azur Airport",
        "year": 1963,
        "date": "1963-05-10 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture14.jpg"
    },
    {
        "id": 6,
        "title": "Tippi Feeding a Tiger",
        "caption": "He loved to come through the window to lick my plate after I was done eating.",
        "album": "On Set",
        "event": "Shooting with Eddie Sanderson",
        "people": [
            "Tippi"
        ],
        "location": "San Fernando Valley",
        "year": 1982,
        "date": "1982-01-25 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture15.jpg"
    },
    {
        "id": 7,
        "title": "Tippi Being Attacked By the Birds",
        "caption": "This shoot was mentally and physically exhausting. I was constantly being attacked by these mechanical birds. I didn't really like birds to begin with, but after that I couldn't stand being surrounded by them.",
        "album": "On Set",
        "event": "Scene from Birds",
        "people": [
            "Tippi"
        ],
        "location": "Universal Studios",
        "year": 1962,
        "date": "1962-07",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture16.jpg"
    },
    {
        "id": 8,
        "title": "Tippi Posing for a Portrait",
        "caption": "I don't remember much, only that the photographer had a big mustache.",
        "album": "Me",
        "event": "Portrait Session",
        "people": [
            "Tippi"
        ],
        "location": "New Ulm, Minnesota",
        "year": 1934,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture17.jpg"
    },
    {
        "id": 9,
        "title": "Melanie and Tippi Posing on the Red Carpet",
        "caption": "My friend Jane, who organized that event, invited us. It was a fun evening.",
        "album": "Awards Show",
        "event": "2nd Annual Hollywood Beauty Awards",
        "people": [
            "Melanie",
            "Tippi"
        ],
        "location": "Avalon Hollywood, Los Angeles",
        "year": 2016,
        "date": "2016-02-21 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture18.jpg"
    },
    {
        "id": 10,
        "title": "Tippi Posing with Melanie and Granddaughters Dakota and Stella",
        "caption": "We coordinated our dresses to be all in black.",
        "album": "Awards Show",
        "event": "ELLE Women in Hollywood Awards",
        "people": [
            "Dakota",
            "Tippi",
            "Melanie",
            "Stella"
        ],
        "location": "Four Seasons Hotel, Los Angeles",
        "year": 2015,
        "date": "2015-10-19 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture19.jpg"
    },
    {
        "id": 11,
        "title": "Tippi Flirting with Husband Noel Marshall",
        "caption": "I thought the necklace he wore was ridiculous. He only did it to tease me.",
        "album": "Hollywood",
        "event": "Client Party",
        "people": [
            "Tippi",
            "Noel"
        ],
        "location": "Beverly Hilton Hotel, Los Angeles",
        "year": 1968,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture20.jpg"
    },
    {
        "id": 12,
        "title": "Tippi and Noel Cutting Their Wedding Cake",
        "caption": "Melanie was so excited about the cake, she kept asking when we were going to cut it.",
        "album": "Wedding",
        "event": "Wedding with Noel",
        "people": [
            "Noel",
            "Tippi",
            "Melanie"
        ],
        "location": "Hollywood's Home",
        "year": 1964,
        "date": "1964-09-27 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture21.jpg"
    },
    {
        "id": 13,
        "title": "Tippi Posing with Melanie at a Party",
        "caption": "The party was in August and it was a very hot day. I almost had a heat stroke after staying outside for that long. We went there with my friend James and he was really worried.",
        "album": "Daughter",
        "event": "Children's party: 'Batman' luncheon for an orphanage in California",
        "people": [
            "Tippi",
            "Melanie"
        ],
        "location": "Orphanage in California",
        "year": 1966,
        "date": "1966-08",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture22.jpg"
    },
    {
        "id": 14,
        "title": "Tippi Getting Something from the Fridge while Neil Looks On",
        "caption": "When we decided to do Roar, Life wanted to do a photo session, so Michael Rougier came to our house to take pictures of us with some of the cats. Among these images, there's this one with Neil hanging around in the kitchen. Everybody was so surprised that we had a 400-pound lion in our home, but he was really well-behaved and he liked to play.",
        "album": "Hollywood",
        "event": "LIFE's photo session during the pre-production of Roar",
        "people": [
            "Tippi",
            "Neil"
        ],
        "location": "Hollywood's Home",
        "year": 1971,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture23.jpg"
    },
    {
        "id": 15,
        "title": "Melanie and Don Posing with Tippi",
        "caption": "That was a party at the Hilton that Paramount Studios had organized,",
        "album": "Daughter",
        "event": "Party",
        "people": [
            "Tippi",
            "Don",
            "Melanie"
        ],
        "location": "California",
        "year": 1973,
        "date": "1973-10-26 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture24.jpg"
    },
    {
        "id": 16,
        "title": "Tippi Posing with Vietnamese Women Who Had Taken the Nail Course",
        "caption": "When the women completed their nail course, we threw a party to celebrate it. We were all very excited for them to start a new career in this industry.",
        "album": "Me",
        "event": "End of nail course celebration",
        "people": [
            "Tippi"
        ],
        "year": 1972,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture25.jpg"
    },
    {
        "id": 17,
        "title": "Tippi Smiling to the Camera",
        "caption": "I celebrated my birthday surrounded by my family and then I was very happy to read all the kind messages people left on Melanie's Instagram post.",
        "album": "Me",
        "event": "95th birthday",
        "people": [
            "Tippi"
        ],
        "location": "Hollywood's Home",
        "year": 2025,
        "date": "2025-01-19 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture26.jpg"
    },
    {
        "id": 18,
        "title": "Tippi and Noel Posing",
        "caption": "This photo was used in The Baltimore Sun to announce our engagement. It was published a few weeks after Marnie was released.",
        "album": "Wedding",
        "event": "Engagement Announcement",
        "people": [
            "Tippi",
            "Noel"
        ],
        "location": "Hollywood",
        "year": 1964,
        "date": "1964-07",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture27.jpg"
    },
    {
        "id": 19,
        "title": "Tippi and Noel Posing",
        "caption": "We almost didn't go to that party, but it ended up being a very fun night. Noel and I danced all night.",
        "album": "Awards Show",
        "event": "Directors Guild of America Awards",
        "people": [
            "Noel",
            "Tippi"
        ],
        "location": "Beverly Hills Hilton, Califonia",
        "year": 1981,
        "date": "1981-03-14 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture28.jpg"
    },
    {
        "id": 20,
        "title": "Tippi Posing with Grandchildren Stella and Alexander",
        "caption": "We got together to celebrate Melanie's birthday. Dakota couldn't come because she was filming in Canada.",
        "album": "Daughter",
        "event": "Melanie's 58 birthday",
        "people": [
            "Stella",
            "Tippi",
            "Alexander"
        ],
        "location": "Culina, Modern Italian, Los Angeles",
        "year": 2015,
        "date": "2015-08-09 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture29.jpg"
    },
    {
        "id": 21,
        "title": "Stella Posing with Her Parents",
        "caption": "Since the wedding was in Spain, I couldn't go, but they facetimed me during the party. I was so glad to see Stella so happy.",
        "album": "Grandchildren",
        "event": "Stella's wedding",
        "people": [
            "Melanie",
            "Stella",
            "Antonio"
        ],
        "location": "Ribera del Duero, Valladolid, Spain",
        "year": 2025,
        "date": "2025-10-18 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture30.jpg"
    },
    {
        "id": 22,
        "title": "Posing with Melanie and Antonio",
        "caption": "We just went to have lunch in LA and one of Antonio's fans approached us and took that picture of us.",
        "album": "Daughter",
        "people": [
            "Melanie",
            "Antonio",
            "Tippi"
        ],
        "location": "Los Angeles",
        "year": 1998,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture31.jpg"
    },
    {
        "id": 23,
        "title": "Posing with Melanie, Stella, and Antonio",
        "caption": "This was a very nice reunion. I hadn't seen Antonio since he and Melanie divorced. it was nice to see him again and we were all happy to celebrate Stella's birthday.",
        "album": "Grandchildren",
        "event": "Stella's 22nd birthday",
        "people": [
            "Melanie",
            "Stella",
            "Antonio",
            "Tippi"
        ],
        "location": "Spago Beverly Hills",
        "year": 2018,
        "date": "1996-09-24 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture32.jpg"
    },
    {
        "id": 24,
        "title": "Posing with Melanie and My Grandchildren",
        "caption": "We had a lovely day out at my sanctuary. We hadn't been together in a while, so we were just walking around seeing and petting the animals and catching up.",
        "album": "Grandchildren",
        "event": "Visit to the sanctuary with grandchildren",
        "people": [
            "Stella",
            "Alexander",
            "Tippi",
            "Melanie",
            "Dakota"
        ],
        "location": "Shambala Preserve",
        "year": 2018,
        "date": "2018-04",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture33.jpg"
    },
    {
        "id": 25,
        "title": "Touring Chicago",
        "caption": "Melanie was filming in Chicago and I decided to join her there to spend some time together. It was very cold and it snowed a lot, but it was fun to spend some time together. We enjoyed touring the city and just hanging out when she was not on set.",
        "album": "Daughter",
        "event": "Trip to Chicago",
        "people": [
            "Tippi",
            "Melanie"
        ],
        "location": "Downtown Chicago",
        "year": 1999,
        "date": "1999-02",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture34.jpg"
    },
    {
        "id": 26,
        "title": "Posing with Daughter and Grandddaughters After Receiving the Star",
        "caption": "I was very honored to receive this. I was surrounded by all of my family and friends. I was told about this some months before and I immediately told Melanie that I wanted to celebrate with them all.",
        "album": "Awards Show",
        "event": "Receiving star in Hollywood Walk of Fame",
        "people": [
            "Dakota",
            "Tippi",
            "Melanie",
            "Stella"
        ],
        "location": "Walk of Fame, Los Angeles",
        "year": 2003,
        "date": "2003-01-30 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture35.jpg"
    },
    {
        "id": 27,
        "title": "Melanie and Tippi Sitting by the Pool",
        "caption": "Noel took this beautiful picture of Melanie and myself. This is during our vacation in Capri, we stayed there all summer.",
        "album": "Europe",
        "event": "Capri Vacation",
        "people": [
            "Melanie",
            "Tippi"
        ],
        "location": "Capri, Italy",
        "year": 1962,
        "date": "1962-07",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture36.jpg"
    },
    {
        "id": 28,
        "title": "Melanie and Tippi Posing in Front of the Lion's Enclosure",
        "caption": "We were visiting London and I just wanted to go and see the animals at the zoo. There was this beautiful couple of lions. They were so curious looking at us and the camera.",
        "album": "Europe",
        "event": "Roar promotion at London",
        "people": [
            "Tippi",
            "Melanie"
        ],
        "location": "London Zoo",
        "year": 1982,
        "date": "1982-03-29 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture37.jpg"
    },
    {
        "id": 29,
        "title": "Tippi with Baby Melanie About to Board the Plane",
        "caption": "We were about to board the plane and a lot of photographers were waiting for us. That was one of the first times that Melanie was seen in public, so they were excited to take pictures of her. I was happy to show everyone my beautiful little girl.",
        "album": "Daughter",
        "event": "Returning from Minnesota to LA",
        "people": [
            "Melanie",
            "Tippi"
        ],
        "location": "Minnesota Airport",
        "year": 1958,
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture38.jpg"
    },
    {
        "id": 30,
        "title": "Tippi and Don Posing Together",
        "caption": "I didn't know Don was coming. It was a nice surprise to see him at my birthday. He drove all the way from Montecito to be there.",
        "album": "Hollywood",
        "event": "94th birthday",
        "people": [
            "Tippi",
            "Don"
        ],
        "location": "Hollywood's Home",
        "year": 2024,
        "date": "2024-01-19 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture39.jpg"
    },
    {
        "id": 31,
        "title": "Posing with My Family, Martin and James",
        "caption": "Martin and James had been with me throughout this process, so it felt very good to end this adventure by capturing a photo together.",
        "album": "Awards Show",
        "event": "Receiving star in Hollywood Walk of Fame",
        "people": [
            "Dakota",
            "Martin",
            "Tippi",
            "James",
            "Stella",
            "Melanie"
        ],
        "location": "Walk of Fame, Los Angeles",
        "year": 2003,
        "date": "2003-01-30 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture40.jpg"
    },
    {
        "id": 32,
        "title": "Posing with Dakota in the Red Carpet",
        "caption": "Dakota invited me to the premiere of her new movie, Suspiria. I was touched by her gesture. Later at the premiere, I felt so proud of my granddaughter. Seeing people celebrating her work just felt great.",
        "album": "Grandchildren",
        "event": "Los Angeles premiere of Suspiria",
        "people": [
            "Tippi",
            "Dakota"
        ],
        "location": "ArcLight Cinemas Cinerama Dome, Hollywood",
        "year": 2018,
        "date": "2018-10-24 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture41.jpg"
    },
    {
        "id": 33,
        "title": "Walking the Red Carpet with Dakota",
        "caption": "Dakota was very sweet all night. She held my hand and she was posing with me in all the pictures. It was really a very heartwarming experience.",
        "album": "Grandchildren",
        "event": "Los Angeles premiere of Suspiria",
        "people": [
            "Tippi",
            "Dakota"
        ],
        "location": "ArcLight Cinemas Cinerama Dome, Hollywood",
        "year": 2018,
        "date": "2018-10-24 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture42.jpg"
    },
    {
        "id": 34,
        "title": "Tippi and Martin Smiling to the Camera",
        "caption": "I was a bit nervous about the questions Don might ask, but everything went well in the end. He was very respectful and friendly. After the Q&A, an old classmate from Minnesota approached me. He had the old year book from back then and he asked me to sign it. It completely took me by surprise, but I was really happy to see somebody from back home. It was also nice to see all the old pictures from when we were in High School.",
        "event": "CVREP Luminary Luncheon",
        "people": [
            "Don Martin",
            "Tippi"
        ],
        "location": "Spa Resort and Casino",
        "year": 2016,
        "date": "2016-12-14 00:00:00",
        "color": "border-blue-400",
        "type": "Photo",
        "imagePath": "/photos/picture43.jpg"
    }
];
