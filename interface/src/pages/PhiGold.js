import React from 'react'
import logo from '../assets/media/logos/MsDoge.png'

const PhiGold = () => {
    return (
        <>
            <div className="container d-flex justify-content-center">

                <div className="col image-wrapper logo">
                    <img src={logo}
                        alt="" style={{mixBlendMode: "multiply"}} />
                </div>
            </div>


            <div className="container mt-5">
                <div className="row">
                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Token address
                                </h5>
                                <div className="card-text" id="tokenAddress">
                                TokenAddress
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Owner address
                                </h5>
                                <div className="card-text" id="ownerAddress">
                                OwnerAddress
                                </div>

                            </div>

                        </div>
                    </div>
                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Token supply
                                </h5>
                                <div className="card-text" id="tokenSupply">
                                Token supply
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Tokens transfered
                                </h5>
                                <div className="card-text" id="tokensTransfered">
                                Tokens Transfered
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Owner balance
                                </h5>
                                <div className="card-text" id="ownerBalance">
                                owner balance
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Lock status
                                </h5>
                                <div className="card-text" id="lockStatus">
                                    false
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <h2 className="mt-5 mb-3 col-sm-12 col-lg-7">Transfer Coins</h2>
                </div>
                <div className="row justify-content-center">
                <div className="col-sm-12 col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                Create mint request
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Send tokens to new address</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="Address" aria-label="Address"
                                            id="createTransferToAddress" />
                                    </div>

                                    <label htmlFor="createTransferToAddress">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="Tokens" aria-label="Address"
                                            id="createTransferToAddress" />
                                    </div>
                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onclick="createTransferRequest()">Create</button>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                Currennt mint request
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">To address</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Tokens (without decimals</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Created By</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton"
                                    onclick="approveTransferRequest()">Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onclick="declineTransferRequest()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        
            <div className="container">
                <div className="row">
                    <h2 className="mt-5 mb-3 col-sm-12 col-lg-7">Burn Coins</h2>
                </div>
                <div className="row justify-content-center">
                <div className="col-sm-12 col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                Create  a Request to Burn Cooins
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Tokens (without decimals</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="Tokens" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onclick="createTransferRequest()">Create</button>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                Create  a Request to Burn Cooins
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Tokens (without decimals</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Created By</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="htmlForm-control w-100" placeholder="" aria-label=""
                                            id="createTransferToAddress" />
                                    </div>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton"
                                    onclick="approveTransferRequest()">Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onclick="declineTransferRequest()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="table-upload-wrapper mt-5">
                <div className="container">
                    <h2 className="mt-5 mb-3">
                    Current Batch Transfer Request
                    </h2>
                </div>
                <div className="container mb-5 mt-1">
                    <table className="table upload-data">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div className="row">
                        <div className="col-sm-12 col-lg-2">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton" onclick="approveTransferRequest()">Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton" onclick="declineTransferRequest()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="container">
                    <h2 className="mt-5 mb-3">
                    Create a Batch Transfer of Coins
                    </h2>
                </div>
                <div className="container controls-section">
                    <div className="upload-file-button">
                        <div className="file-indicator">
                            Chose file to upload
                        </div>
                        <label htmlFor="file-upload" className="custom-file-upload btn  btn-success">
                            Browse
                        </label>
                        <input id="file-upload" type="file" />
                    </div>

                    <button id="uploadBtn" className="btn btn-success disabled">Upload</button>

                    <div className="filler"></div>
                </div>

                <div className="container mb-5 mt-5">
                    <table className="table upload-data">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>


                <div className="container mb-5 mt-10">
                    <h2 className="mt-5 mb-3">
                    Last Trannsfers
                    </h2>
                    <table id="upload-table" className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>

                </div>
            </div>
        </>
    )
}

export default PhiGold
