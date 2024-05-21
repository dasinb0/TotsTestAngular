import { Component, ViewChild } from '@angular/core';
import { TotsListResponse } from '@tots/core';
import {
  MoreMenuColumnComponent,
  TotsActionTable,
  TotsColumn,
  TotsStringColumn,
  TotsTableComponent,
  TotsTableConfig,
} from '@tots/table';
import { delay, of, tap } from 'rxjs';
import { Client } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client.service';
import { ClientsData } from 'src/app/interfaces/clientsData';
import {
  AvatarPhotoFieldComponent,
  StringFieldComponent,
  SubmitButtonFieldComponent,
  TextareaFieldComponent,
  TotsFormModalService,
  TotsModalConfig,
} from '@tots/form';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @ViewChild('tableComp') tableComp!: TotsTableComponent;

  config = new TotsTableConfig();

  items!: Client[];

  constructor(
    private clientSrv: ClientService,
    protected modalService: TotsFormModalService
  ) {}

  ngOnInit(): void {
    this.setConfig();
  }

  setConfig() {
    this.config.id = 'clients-table';
  
    this.config.columns = [
      new TotsStringColumn(
        'firstname',
        'firstname',
        'Nombre',
        true,
        undefined,
        ''
      ),
      new TotsStringColumn(
        'lastname',
        'lastname',
        'Apellido',
        true,
        undefined,
        ''
      ),
      new TotsStringColumn('email', 'email', 'Email', true, undefined, ''),
      {
        key: 'more',
        component: MoreMenuColumnComponent,
        title: '',
        extra: {
          stickyEnd: true,
          width: '60px',
          actions: [
            { icon: 'add', title: 'Editar', key: 'edit' },
            { icon: 'add', title: 'Eliminar', key: 'delete' },
          ],
        },
      },
    ];
  
    this.clientSrv.getClientsList().subscribe({
      next: (res: ClientsData) => {
        this.items = res.response.data;
  
        let data = new TotsListResponse();
        data.data = [...this.items];
        data.total = 50;
  
        this.config.obs = of(data);
        this.tableComp.loadItems();
      },
      error: (_err) => {
        // Manejar el error de alguna manera, como mostrar un mensaje de error al usuario
      },
      complete() {
        // suscripción esté completa
      },
    });
  }  

  onOrder(column: TotsColumn) {
    let data = new TotsListResponse();
    data.data = [
      ...this.items.sort((a, b) => {
        if (column.order == 'asc') {
          return a[column.key as keyof Client]
            .toString()
            .localeCompare(b[column.key as keyof Client].toString());
        } else {
          return b[column.key as keyof Client]
            .toString()
            .localeCompare(a[column.key as keyof Client].toString());
        }
      }),
    ];

    this.config.obs = of(data);
    this.tableComp?.loadItems();
  }

  onTableAction(action: TotsActionTable) {
    if (action.key == 'click-order') {
      this.onOrder(action.item);
    } else if (action.key == 'edit') {
      this.openForm(action.item);
    } else if (action.key == 'delete') {
      this.deleteItem(action.item);
    }
  }

  addItem(client: Client) {
    this.items = [client, ...this.items];

    let data = new TotsListResponse();
    data.data = this.items;

    this.config.obs = of(data);
    this.tableComp?.loadItems();
  }

  deleteItem(client: Client) {
    let config = new TotsModalConfig();
    config.title = `Estas seguro de querer eliminar al cliente ${client.firstname} ${client.lastname}`;
    config.item = client;
    config.fields = [
      {
        key: 'submit',
        component: SubmitButtonFieldComponent,
        label: 'Eliminar',
      },
      {
        key: 'cancel',
        component: SubmitButtonFieldComponent,
        label: 'Cancelar',
      },
    ];
    this.modalService
      .open(config)
      .pipe(
        tap((action) => {
          if (action.key == 'submit') {
            action.modal?.componentInstance.showLoading();
            this.clientSrv.deleteClient(config.item.id).subscribe({
              next: () => {
                action.modal?.close();
                this.items = this.items.filter((i) => i.id != config.item.id);
                let data = new TotsListResponse();
                data.data = this.items;

                this.config.obs = of(data);
                this.tableComp?.loadItems();
              },
              error: (_err) => {
                // Manejar el error de alguna manera, como mostrar un mensaje de error al usuario
              },
            });
          }
          if (action.key == 'cancel') {
            action.modal?.close();
          }
        })
      )
      .pipe(delay(2000))
      .subscribe(() => {});
  }

  openForm(client?: Client) {
    let config = new TotsModalConfig();
    config.item = client || {};
    const typeTitle = config.item.id ? 'Editar cliente' : 'Agregar cliente';
    config.title = typeTitle;
    config.autoSave = true;
    config.fields = [
      {
        key: 'firstname',
        component: StringFieldComponent,
        label: 'Nombre',
        validators: [Validators.required],
      },
      {
        key: 'lastname',
        component: StringFieldComponent,
        label: 'Apellido',
        validators: [Validators.required],
      },
      {
        key: 'email',
        component: StringFieldComponent,
        label: 'Email',
        validators: [Validators.required],
      },
      {
        key: 'address',
        component: StringFieldComponent,
        label: 'Dirección',
      },
      {
        key: 'photo',
        component: AvatarPhotoFieldComponent,
        label: 'Foto',
        extra: {
          button_text: 'Subir foto',
          remove_text: 'Eliminar foto',
          service: {
            upload: (e: any) => {
              const objectURL = URL.createObjectURL(e);
              return of({
                url: objectURL,
              });
            },
          },
        },
      },
      {
        key: 'caption',
        component: TextareaFieldComponent,
        label: 'Información adicional',
      },
      {
        key: 'submit',
        component: SubmitButtonFieldComponent,
        label: typeTitle,
      },
      {
        key: 'close',
        component: SubmitButtonFieldComponent,
        label: 'Cerrar',
      }
    ];
    this.modalService
      .open(config)
      .pipe(
        tap((action) => {
          if (action.key == 'submit') {
            action.modal?.componentInstance.showLoading();
            this.clientSrv.updateClient(config.item).subscribe({
              next: (res) => {
                if (!config.item.id) this.addItem(res.response);
              },
              error: (_err) => {
                // Manejar el error de alguna manera, como mostrar un mensaje de error al usuario
              },
              complete: () => {
                action.modal?.close();
              },
            });
          } else if (action.key == 'close') {
            action.modal?.close();
          }
        })
      )
      .pipe(delay(2000))
      .subscribe(() => {});
  }
}  
