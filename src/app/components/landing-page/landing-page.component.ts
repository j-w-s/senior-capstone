import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginRegService } from '../../services/login-reg.service';

interface Animal {
  owner: string;
  owner_image: string;
  animal_type: string;
  animal_breeds: string[];
  animal_name: string;
  animal_weight: number;
  animal_sex: string;
  zip: number;
  about: string;
  medical_history: string;
  image: string;
}

@Component({
  selector: 'landing-page',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  imports: [MatToolbarModule, CommonModule,
    MatTabsModule, MatButtonModule, MatIconModule,
    MatGridListModule, MatCardModule, FlexLayoutModule,
    MatExpansionModule, MatInputModule, MatFormFieldModule, FormsModule,
    MatMenuModule, LoginRegisterComponent, FooterComponent ],
  standalone: true
})

export class LandingPageComponent {

  showDialog = false;
  constructor(private ngZone: NgZone, public loginRegService: LoginRegService) { }
  filterType?: string;
  filterBreeds?: string;
  filterSex?: string;
  filterZip?: string;
  currentPage = 0;

  animal: Animal = {
    "owner": "Carter Simmons",
    "owner_image": "https://images.unsplash.com/photo-1612214070475-1e73f478188c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJsYWNrJTIwbWFufGVufDB8fDB8fHww",
    "animal_type": "dog",
    "animal_breeds": ["Cavalier King Charles Spaniel"],
    "animal_name": "Charlie",
    "animal_weight": 15.8,
    "animal_sex": "male",
    "zip": 71273,
    "about": "Affectionate and good with children, loves belly rubs.",
    "medical_history": "No known health issues.",
    "image": "https://www.akc.org/wp-content/uploads/2017/11/Cavalier-King-Charles-Spaniel-standing-in-the-grass.jpg"
  }; // placeholder

  animals = [
    {
      "owner": "Emily Walker",
      "owner_image": "https://img.freepik.com/free-photo/cheerful-dark-skinned-woman-smiling-broadly-rejoicing-her-victory-competition-among-young-writers-standing-isolated-against-grey-wall-people-success-youth-happiness-concept_273609-1246.jpg",
      "animal_type": "ferret",
      "animal_breeds": ["Sable"],
      "animal_name": "Slinky",
      "animal_weight": 1.8,
      "animal_sex": "male",
      "zip": 71271,
      "about": "Curious and playful, loves tunnels.",
      "medical_history": "Vaccinated and descented.",
      "image": "https://a-z-animals.com/media/2022/10/shutterstock_2016030662-1024x683.jpg"
    },
    {
      "owner": "Aiden Lewis",
      "owner_image": "https://images.unsplash.com/photo-1610088441520-4352457e7095?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1lbnxlbnwwfHwwfHx8MA%3D%3D",
      "animal_type": "dog",
      "animal_breeds": ["French Bulldog"],
      "animal_name": "Mochi",
      "animal_weight": 14.5,
      "animal_sex": "female",
      "zip": 71272,
      "about": "Adorable and affectionate, enjoys short walks.",
      "medical_history": "No known health issues.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/2008-07-28_Dog_at_Frolick_Field.jpg/640px-2008-07-28_Dog_at_Frolick_Field.jpg"
    },
    {
      "owner": "Nathan White",
      "owner_image": "https://media.istockphoto.com/id/1149504274/photo/portrait-of-a-taiwanese-man.jpg?s=612x612&w=0&k=20&c=uiQDg8fKN1LCTCU-AxNosEagZAwt7mZdAqRqMLDatyI=",
      "animal_type": "hamster",
      "animal_breeds": ["Syrian"],
      "animal_name": "Nibbles",
      "animal_weight": 0.2,
      "animal_sex": "female",
      "zip": 71272,
      "about": "Loves running on her wheel, enjoys fresh veggies.",
      "medical_history": "Regular dental check-ups.",
      "image": "https://www.reptilecymru.co.uk/wp-content/uploads/2021/03/Syrian-Hamster-Handling.png"
    },
    {
      "owner": "Isabella Turner",
      "owner_image": "https://media.npr.org/assets/img/2023/03/09/sablan-pascale-71125f5b63960326821528944612cc0325b4e464-s1100-c50.jpg",
      "animal_type": "parakeet",
      "animal_breeds": ["Budgerigar"],
      "animal_name": "Skye",
      "animal_weight": 0.05,
      "animal_sex": "unspecified",
      "zip": 71272,
      "about": "Lively and social, enjoys mimicking sounds.",
      "medical_history": "Regular feather grooming.",
      "image": "https://www.thesprucepets.com/thmb/MhizOAedoNxo1Owzt4TktRPMMfM=/2724x0/filters:no_upscale():strip_icc()/parakeet-97839520-5b4d67f9c9e77c003725a47b.jpg"
    },
    {
      "owner": "Brandon Adams",
      "owner_image": "https://us.images.westend61.com/0001159215pw/portrait-of-an-indian-man-looking-serious-ALBF00790.jpg",
      "animal_type": "turtle",
      "animal_breeds": ["Red-Eared Slider"],
      "animal_name": "Sheldon",
      "animal_weight": 1.0,
      "animal_sex": "male",
      "zip": 71272,
      "about": "Loves basking under the heat lamp, enjoys swimming.",
      "medical_history": "Shell is in good condition.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/9/96/RedEaredSlider05.jpg"
    },
    {
      "owner": "Grace Martinez",
      "owner_image": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      "animal_type": "cat",
      "animal_breeds": ["Ragdoll"],
      "animal_name": "Luna",
      "animal_weight": 14.2,
      "animal_sex": "female",
      "zip": 71271,
      "about": "Calm and affectionate, enjoys being held.",
      "medical_history": "Indoor cat with regular check-ups.",
      "image": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT1svz6SfvAC6h13SoZApIjunfxM5Js-5sGRggqxQOeKLSWEd86"
    },
    {
      "owner": "Ethan Parker",
      "owner_image": "https://images.unsplash.com/photo-1584043720379-b56cd9199c94?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lbnxlbnwwfHwwfHx8MA%3D%3D",
      "animal_type": "snake",
      "animal_breeds": ["Corn Snake"],
      "animal_name": "Serpentina",
      "animal_weight": 1.8,
      "animal_sex": "female",
      "zip": 71271,
      "about": "Docile and easy to handle, requires a warm habitat.",
      "medical_history": "Eats well and sheds regularly.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/e/ef/CornSnake.jpg"
    },
    {
      "owner": "Ava Carter",
      "owner_image": "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2hpdGUlMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D",
      "animal_type": "fish",
      "animal_breeds": ["Betta"],
      "animal_name": "Splash",
      "animal_weight": 0.1,
      "animal_sex": "unspecified",
      "zip": 71271,
      "about": "Colorful and lively, lives in a well-maintained tank.",
      "medical_history": "No signs of illness, regular water changes.",
      "image": "https://www.thesprucepets.com/thmb/kSF6E0-qzV4aXUih9WD-UhnvoRc=/5482x0/filters:no_upscale():strip_icc()/how-long-do-bettas-live-1380782-hero-813aa5d34bab48cdb333edfe02471dad.jpg"
    },
    {
      "owner": "Liam Cooper",
      "owner_image": "https://images.unsplash.com/photo-1568990545613-aa37e9353eb6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2hpdGUlMjBtYW58ZW58MHx8MHx8fDA%3D",
      "animal_type": "rabbit",
      "animal_breeds": ["Mini Lop"],
      "animal_name": "Thumper",
      "animal_weight": 2.5,
      "animal_sex": "male",
      "zip": 71272,
      "about": "Loves exploring and hopping around the garden.",
      "medical_history": "Neutered and vaccinated.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Miniature_Lop_-_Side_View.jpg"
    },
    {
      "owner": "Zoe Foster",
      "owner_image": "https://www.beautycrew.com.au/media/54107/jodie-comer-most-beautiful-woman-p.png?width=720",
      "animal_type": "dog",
      "animal_breeds": ["Shiba Inu"],
      "animal_name": "Kai",
      "animal_weight": 20.1,
      "animal_sex": "male",
      "zip": 71273,
      "about": "Energetic and loyal, enjoys outdoor adventures.",
      "medical_history": "Up-to-date on vaccinations.",
      "image": "https://www.akc.org/wp-content/uploads/2017/11/Shiba-Inu-standing-in-profile-outdoors.jpg"
    },
    {
      "owner": "Harper Nelson",
      "owner_image": "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      "animal_type": "guinea pig",
      "animal_breeds": ["Peruvian"],
      "animal_name": "Puff",
      "animal_weight": 1.4,
      "animal_sex": "female",
      "zip": 71273,
      "about": "Fluffy and enjoys being groomed, loves hay.",
      "medical_history": "Regular dental check-ups.",
      "image": "https://images.rove.me/w_1920,q_85/rpusqvmpplbbyhx6z1w7/peru-guinea-pig-festival.jpg"
    },
    {
      "owner": "Carter Simmons",
      "owner_image": "https://images.unsplash.com/photo-1612214070475-1e73f478188c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJsYWNrJTIwbWFufGVufDB8fDB8fHww",
      "animal_type": "dog",
      "animal_breeds": ["Cavalier King Charles Spaniel"],
      "animal_name": "Charlie",
      "animal_weight": 15.8,
      "animal_sex": "male",
      "zip": 71273,
      "about": "Affectionate and good with children, loves belly rubs.",
      "medical_history": "No known health issues.",
      "image": "https://www.akc.org/wp-content/uploads/2017/11/Cavalier-King-Charles-Spaniel-standing-in-the-grass.jpg"
    },
    {
      "owner": "Peyton Baker",
      "owner_image": "https://t3.ftcdn.net/jpg/02/23/61/36/360_F_223613686_2LXNahDJdD6i7TBGi8qKWxNhbaJKD116.jpg",
      "animal_type": "parrot",
      "animal_breeds": ["Eclectus"],
      "animal_name": "Rio",
      "animal_weight": 2.0,
      "animal_sex": "unspecified",
      "zip": 71272,
      "about": "Colorful and talkative, enjoys fresh fruits.",
      "medical_history": "Regular feather grooming.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/1/16/Eclectus_Parrot_%28Eclectus_roratus%29_-pair.jpg"
    },
    {
      "owner": "Avery Murphy",
      "owner_image": "https://img.freepik.com/premium-photo/portrait-smiling-patient-therapy-office_23-2148759153.jpg",
      "animal_type": "cat",
      "animal_breeds": ["Sphynx"],
      "animal_name": "Naked Nellie",
      "animal_weight": 8.6,
      "animal_sex": "female",
      "zip": 71271,
      "about": "Hairless and affectionate, enjoys warm spots.",
      "medical_history": "Sensitive skin, requires sunscreen.",
      "image": "https://www.purina.co.uk/sites/default/files/styles/square_medium_440x440/public/2022-06/Sphynx.2.jpg?h=835c6184&itok=3YS8QVmh"
    },
    {
      "owner": "Jordan Reed",
      "owner_image": "https://www.shutterstock.com/image-photo/portrait-healthy-happy-middleaged-african-600nw-1864631416.jpg",
      "animal_type": "turtle",
      "animal_breeds": ["Eastern Box Turtle"],
      "animal_name": "Terrance",
      "animal_weight": 0.8,
      "animal_sex": "male",
      "zip": 71273,
      "about": "Enjoys basking in the sun, requires a varied diet.",
      "medical_history": "Shell is in good condition.",
      "image": "https://www.nps.gov/articles/images/eastern-box-turtle_PD_Richard-Coldiron.jpeg"
    },
    {
      "owner": "Morgan Price",
      "owner_image": "https://images.unsplash.com/photo-1583195763986-0231686dcd43?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdoaXRlJTIwbWFufGVufDB8fDB8fHww",
      "animal_type": "hamster",
      "animal_breeds": ["Roborovski"],
      "animal_name": "Whisk",
      "animal_weight": 0.1,
      "animal_sex": "male",
      "zip": 71273,
      "about": "Tiny and quick, enjoys running on the wheel.",
      "medical_history": "No known health issues.",
      "image": "https://images.saymedia-content.com/.image/t_share/MTc0Mzg2MjQ4MzA2MTQwODA2/a-complete-guide-to-roborovski-hamsters.jpg"
    },
    {
      "owner": "Taylor Hayes",
      "owner_image": "https://media.licdn.com/dms/image/C4D12AQF0nGTWx9o_3Q/article-cover_image-shrink_720_1280/0/1567548798604?e=2147483647&v=beta&t=1ghxUJ4BN4kKlOkD_l6gmPIv5u7niITEkWluqf10QTg",
      "animal_type": "fish",
      "animal_breeds": ["Goldfish"],
      "animal_name": "Bubbles",
      "animal_weight": 0.2,
      "animal_sex": "unspecified",
      "zip": 71273,
      "about": "Bright and colorful, lives in a spacious aquarium.",
      "medical_history": "No signs of illness, regular water changes.",
      "image": "https://cdn.britannica.com/12/117212-050-3267CED6/Goldfish-behaviour-water-temperature.jpg"
    },
    {
      "owner": "Alex Morgan",
      "owner_image": "https://thumbs.dreamstime.com/b/headshot-year-old-boy-portrait-wearing-black-t-shirt-265749625.jpg",
      "animal_type": "rabbit",
      "animal_breeds": ["Flemish Giant"],
      "animal_name": "Thistle",
      "animal_weight": 6.3,
      "animal_sex": "female",
      "zip": 71272,
      "about": "Gentle giant, enjoys nibbling on leafy greens.",
      "medical_history": "Spayed and vaccinated.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Sandy_Flemish_Giant.jpg"
    },
    {
      "owner": "Riley Carter",
      "owner_image": "https://images.pexels.com/photos/6633648/pexels-photo-6633648.jpeg?cs=srgb&dl=pexels-cup-of-couple-6633648.jpg&fm=jpg",
      "animal_type": "snake",
      "animal_breeds": ["King Snake"],
      "animal_name": "Scales",
      "animal_weight": 1.3,
      "animal_sex": "unspecified",
      "zip": 71272,
      "about": "Docile and easy to handle, requires a warm habitat.",
      "medical_history": "Eats well and sheds regularly.",
      "image": "https://putahcreekcouncil.org/wp-content/uploads/california-kingsnake-02.jpg"
    },
    {
      "owner": "Hayden Cooper",
      "owner_image": "https://cdn.shopify.com/s/files/1/0628/2445/files/what-is-white-tie-attire_1024x1024.jpg?v=1670290045",
      "animal_type": "dog",
      "animal_breeds": ["Australian Shepherd"],
      "animal_name": "Misty",
      "animal_weight": 25.5,
      "animal_sex": "female",
      "zip": 71272,
      "about": "Energetic and intelligent, loves agility training.",
      "medical_history": "Up-to-date on vaccinations.",
      "image": "https://www.akc.org/wp-content/uploads/2017/11/Australian-Shepherd.1.jpg"
    }
  ];

  totalPages = Math.ceil(this.animals.length / 8);
  filteredResults = this.animals;

  selectTab(updatedIndex: number): void {
    this.ngZone.run(() => {
      this.loginRegService.tabIndex = updatedIndex;
    });
  }

  isLastPage() {
    return this.currentPage === this.totalPages - 1;
  }

  isFirstPage() {
    return this.currentPage === 0;
  }

  nextPage() {
    this.currentPage++;
  }

  lastPage() {
    this.currentPage--;
  }

  loadAnimalDataForDisplay(animal: Animal) {
    this.animal = animal;
    this.selectTab(2);
  }

  message = '';
  user_messages: object[] = [];

  sendMessage() {
    if (this.message) {
      this.user_messages.push({
        owner_image: 'default_image.jpg',
        owner: this.message
      });
      this.message = '';
    }
  }

  updateFilter() {
    this.filteredResults = this.animals.filter(animal => {
      return (
        (this.filterType ? animal.animal_type === this.filterType : true) &&
        (this.filterBreeds ? animal.animal_breeds[0] === this.filterBreeds : true) &&
        (this.filterSex ? animal.animal_sex === this.filterSex : true) &&
        (this.filterZip ? animal.zip.toString() === this.filterZip : true)
      );
    });
  }

  resetFilter() {
    this.filteredResults = this.animals;
  }

}
